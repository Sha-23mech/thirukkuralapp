import { MaterialCommunityIcons, Ionicons, Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import data from "@/data/thirukkural.json";

type Kural = (typeof data.pals)[0]["adhikarams"][0]["kurals"][0];

function findKuralAdhikaram(kuralNumber: number) {
  for (const pal of data.pals) {
    for (const adhikaram of pal.adhikarams) {
      const kural = adhikaram.kurals.find((k) => k.number === kuralNumber);
      if (kural) return { kural, adhikaram, pal };
    }
  }
  return null;
}

function getAllKurals(): Kural[] {
  const result: Kural[] = [];
  for (const pal of data.pals) {
    for (const adhikaram of pal.adhikarams) {
      result.push(...adhikaram.kurals);
    }
  }
  return result;
}

/** Split commentary into readable paragraphs */
function splitCommentaryToParagraphs(commentary: string): string[] {
  if (!commentary) return [];

  // Split on sentence-ending Tamil/English patterns
  // Split after . or ' or ". " that end a thought
  const parts = commentary
    .replace(/\.\s+(?=[^\s])/g, ".\n")
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Group short fragments back together (< 60 chars)
  const grouped: string[] = [];
  let buffer = "";

  for (const part of parts) {
    if (buffer.length === 0) {
      buffer = part;
    } else if (buffer.length < 80) {
      buffer = buffer + " " + part;
    } else {
      grouped.push(buffer);
      buffer = part;
    }
  }
  if (buffer.length > 0) grouped.push(buffer);

  return grouped;
}

export default function KuralDetailScreen() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const [showTransliteration, setShowTransliteration] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [expandedCommentary, setExpandedCommentary] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const kuralNumber = parseInt(number || "4", 10);
  const allKurals = getAllKurals();
  const found = findKuralAdhikaram(kuralNumber);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 9,
      }),
    ]).start();
  }, [kuralNumber]);

  if (!found) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <Text style={styles.errorText}>குறள் கிடைக்கவில்லை</Text>
      </View>
    );
  }

  const { kural, adhikaram, pal } = found;
  const currentIndex = allKurals.findIndex((k) => k.number === kuralNumber);
  const prevKural = currentIndex > 0 ? allKurals[currentIndex - 1] : null;
  const nextKural = currentIndex < allKurals.length - 1 ? allKurals[currentIndex + 1] : null;

  const tamilLines = kural.tamil.split("\n");
  const transliterLines = kural.transliteration.split("\n");
  const commentaryParagraphs = splitCommentaryToParagraphs(kural.commentary);
  const visibleParagraphs = expandedCommentary
    ? commentaryParagraphs
    : commentaryParagraphs.slice(0, 3);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleBookmark = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBookmarked(!bookmarked);
  };

  const handleNav = (kuralNum: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedCommentary(false);
    setShowTransliteration(false);
    router.replace({ pathname: "/kural/[number]", params: { number: kuralNum } });
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.light.tint} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>குறள்</Text>
          <Text style={styles.headerNumber}>எண் {kural.number}</Text>
        </View>

        <Pressable
          onPress={handleBookmark}
          style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={bookmarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={bookmarked ? Colors.light.gold : Colors.light.textMuted}
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Verse Card */}
          <View style={styles.verseCard}>
            <View style={styles.verseCardHeader}>
              <MaterialCommunityIcons name="format-quote-open" size={28} color={Colors.light.gold} />
              <View style={styles.palBadge}>
                <Text style={styles.palBadgeText}>{adhikaram.name}</Text>
              </View>
            </View>

            <View style={styles.verseBlock}>
              {tamilLines.map((line, idx) => (
                <Text key={idx} style={styles.verseLine}>{line}</Text>
              ))}
            </View>

            <Pressable
              onPress={() => setShowTransliteration(!showTransliteration)}
              style={({ pressed }) => [styles.toggleRow, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Feather
                name={showTransliteration ? "eye-off" : "eye"}
                size={13}
                color={Colors.light.textMuted}
              />
              <Text style={styles.toggleText}>
                {showTransliteration ? "Hide" : "Show"} transliteration
              </Text>
            </Pressable>

            {showTransliteration && (
              <View style={styles.transliterBlock}>
                {transliterLines.map((line, idx) => (
                  <Text key={idx} style={styles.transliterLine}>{line}</Text>
                ))}
              </View>
            )}
          </View>

          {/* Commentary Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <MaterialCommunityIcons name="comment-text-outline" size={16} color={Colors.light.tint} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>விளக்கம்</Text>
              <Text style={styles.sectionSubtitle}>Commentary</Text>
            </View>
          </View>

          <View style={styles.commentaryCard}>
            {visibleParagraphs.map((para, idx) => (
              <View key={idx} style={idx > 0 ? styles.paragraphSpacing : undefined}>
                <Text style={styles.paragraphText}>{para}</Text>
              </View>
            ))}

            {commentaryParagraphs.length > 3 && (
              <Pressable
                onPress={() => setExpandedCommentary(!expandedCommentary)}
                style={({ pressed }) => [styles.expandBtn, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={styles.expandBtnText}>
                  {expandedCommentary ? "குறைக்க" : "மேலும் வாசிக்க"}
                </Text>
                <Ionicons
                  name={expandedCommentary ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={Colors.light.tint}
                />
              </Pressable>
            )}
          </View>

          {/* Meta Info */}
          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <View style={styles.metaIconWrap}>
                <MaterialCommunityIcons name="bookmark-outline" size={15} color={Colors.light.tint} />
              </View>
              <View style={styles.metaTextWrap}>
                <Text style={styles.metaLabel}>அதிகாரம் / Adhikaram</Text>
                <Text style={styles.metaValue}>{adhikaram.name} — {adhikaram.meaning}</Text>
              </View>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaRow}>
              <View style={styles.metaIconWrap}>
                <MaterialCommunityIcons name="book-outline" size={15} color={Colors.light.tint} />
              </View>
              <View style={styles.metaTextWrap}>
                <Text style={styles.metaLabel}>பால் / Pal</Text>
                <Text style={styles.metaValue}>{pal.name} — {pal.meaning}</Text>
              </View>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaRow}>
              <View style={styles.metaIconWrap}>
                <MaterialCommunityIcons name="account-outline" size={15} color={Colors.light.tint} />
              </View>
              <View style={styles.metaTextWrap}>
                <Text style={styles.metaLabel}>உரையாசிரியர் / Commentary by</Text>
                <Text style={styles.metaValue}>{data.book.commentaryAuthor}</Text>
              </View>
            </View>
          </View>

        </Animated.View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={[styles.navBar, { paddingBottom: bottomPadding + 8 }]}>
        <Pressable
          onPress={() => prevKural && handleNav(prevKural.number)}
          disabled={!prevKural}
          style={({ pressed }) => [
            styles.navBtn,
            !prevKural && styles.navBtnDisabled,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={prevKural ? Colors.light.tint : Colors.light.textMuted}
          />
          <Text style={[styles.navBtnText, !prevKural && styles.navBtnTextDisabled]}>
            {prevKural ? `குறள் ${prevKural.number}` : "முதல்"}
          </Text>
        </Pressable>

        <View style={styles.navProgress}>
          <Text style={styles.navProgressText}>
            {currentIndex + 1} / {allKurals.length}
          </Text>
        </View>

        <Pressable
          onPress={() => nextKural && handleNav(nextKural.number)}
          disabled={!nextKural}
          style={({ pressed }) => [
            styles.navBtn,
            !nextKural && styles.navBtnDisabled,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.navBtnText, !nextKural && styles.navBtnTextDisabled]}>
            {nextKural ? `குறள் ${nextKural.number}` : "கடைசி"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={nextKural ? Colors.light.tint : Colors.light.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.separator,
    backgroundColor: Colors.light.background,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerNumber: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginTop: 1,
  },

  /* Scroll */
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },

  /* Verse Card */
  verseCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    padding: 18,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  verseCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  palBadge: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
  },
  palBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  verseBlock: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.gold,
    gap: 8,
    marginBottom: 14,
  },
  verseLine: {
    fontSize: 21,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    lineHeight: 33,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  toggleText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  transliterBlock: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.separator,
    gap: 6,
  },
  transliterLine: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    fontStyle: "italic",
    lineHeight: 22,
  },

  /* Commentary Section */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    lineHeight: 22,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    lineHeight: 16,
  },
  commentaryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    padding: 18,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  paragraphText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 26,
    textAlign: "left",
  },
  paragraphSpacing: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.light.separator,
  },
  expandBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.separator,
  },
  expandBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.tint,
  },

  /* Meta Card */
  metaCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    overflow: "hidden",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 12,
  },
  metaIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  metaTextWrap: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
    lineHeight: 20,
  },
  metaDivider: {
    height: 1,
    backgroundColor: Colors.light.separator,
    marginHorizontal: 14,
  },

  /* Bottom Nav */
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.separator,
    backgroundColor: Colors.light.background,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.tint,
  },
  navBtnTextDisabled: {
    color: Colors.light.textMuted,
  },
  navProgress: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundTertiary,
  },
  navProgressText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },

  errorText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
});
