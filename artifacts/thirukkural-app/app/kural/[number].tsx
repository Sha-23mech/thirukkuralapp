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
import { useGetKuralByNumber } from "@workspace/api-client-react";

export default function KuralDetailScreen() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const [showTransliteration, setShowTransliteration] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const kuralNumber = parseInt(number || "1", 10);
  const { data: kural, isLoading, error } = useGetKuralByNumber(kuralNumber);

  useEffect(() => {
    if (!isLoading && kural) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
      ]).start();
    }
  }, [isLoading, kural]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topPadding, justifyContent: 'center', alignItems: 'center' }]}>
        <Text>காத்திருக்கவும்...</Text>
      </View>
    );
  }

  if (error || !kural) {
    return (
      <View style={[styles.container, { paddingTop: topPadding, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>குறள் கிடைக்கவில்லை</Text>
      </View>
    );
  }

  const prevNumber = kuralNumber > 1 ? kuralNumber - 1 : null;
  const nextNumber = kuralNumber < 1330 ? kuralNumber + 1 : null;

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
    router.replace({ pathname: "/kural/[number]", params: { number: kuralNum } });
  };

  const tamilLines = kural.tamil.split("\n");
  const transliterLines = kural.transliteration.split("\n");

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
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
          style={({ pressed }) => [styles.bookmarkButton, { opacity: pressed ? 0.6 : 1 }]}
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
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.verseCard}>
            <View style={styles.verseCardHeader}>
              <MaterialCommunityIcons name="format-quote-open" size={32} color={Colors.light.gold} />

            </View>

            <View style={styles.verseLines}>
              {tamilLines.map((line, idx) => (
                <Text key={idx} style={styles.verseLine}>{line}</Text>
              ))}
            </View>

            <Pressable
              onPress={() => setShowTransliteration(!showTransliteration)}
              style={({ pressed }) => [styles.transliterToggle, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Feather
                name={showTransliteration ? "eye-off" : "eye"}
                size={14}
                color={Colors.light.textMuted}
              />
              <Text style={styles.transliterToggleText}>
                {showTransliteration ? "Hide" : "Show"} Transliteration
              </Text>
            </Pressable>

            {showTransliteration && (
              <View style={styles.transliterationContainer}>
                {transliterLines.map((line, idx) => (
                  <Text key={idx} style={styles.transliterationLine}>{line}</Text>
                ))}
              </View>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="comment-text" size={18} color={Colors.light.tint} />
            <Text style={styles.sectionTitle}>உரை</Text>
            <Text style={styles.sectionTitleEn}>Commentary</Text>
          </View>

          <View style={styles.commentaryCard}>
            <Text style={styles.commentaryText}>{kural.commentary}</Text>
          </View>

          <View style={styles.metaSection}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>அதிகாரம் எண்</Text>
              <Text style={styles.metaValue}>{kural.adhikaramId}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>உரையாசிரியர்</Text>
              <Text style={styles.metaValue} numberOfLines={2}>ஞானவள்ளல் மகாகனம் தங்கசுவாமிகள்</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.navBar, { paddingBottom: bottomPadding + 8 }]}>
        <Pressable
          onPress={() => prevNumber && handleNav(prevNumber)}
          disabled={!prevNumber}
          style={({ pressed }) => [
            styles.navButton,
            !prevNumber && styles.navButtonDisabled,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={prevNumber ? Colors.light.tint : Colors.light.textMuted}
          />
          <Text style={[styles.navButtonText, !prevNumber && styles.navButtonTextDisabled]}>
            {prevNumber ? `குறள் ${prevNumber}` : "முதல் குறள்"}
          </Text>
        </Pressable>

        <View style={styles.navDots}>
          <View style={[styles.navDot, styles.navDotActive]} />
        </View>

        <Pressable
          onPress={() => nextNumber && handleNav(nextNumber)}
          disabled={!nextNumber}
          style={({ pressed }) => [
            styles.navButton,
            !nextNumber && styles.navButtonDisabled,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.navButtonText, !nextNumber && styles.navButtonTextDisabled]}>
            {nextNumber ? `குறள் ${nextNumber}` : "கடைசி குறள்"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={nextNumber ? Colors.light.tint : Colors.light.textMuted}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
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
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  verseCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 16,
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
  verseLines: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.gold,
    marginBottom: 16,
    gap: 6,
  },
  verseLine: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    lineHeight: 34,
  },
  transliterToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  transliterToggleText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  transliterationContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.light.separator,
    gap: 4,
  },
  transliterationLine: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    fontStyle: "italic",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  sectionTitleEn: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  commentaryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    padding: 18,
    marginBottom: 20,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  commentaryText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 26,
    textAlign: "justify",
  },
  metaSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    overflow: "hidden",
    marginBottom: 20,
  },
  metaItem: {
    padding: 14,
  },
  metaLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  metaDivider: {
    height: 1,
    backgroundColor: Colors.light.separator,
  },
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
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.tint,
  },
  navButtonTextDisabled: {
    color: Colors.light.textMuted,
  },
  navDots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  navDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.backgroundTertiary,
  },
  navDotActive: {
    width: 14,
    backgroundColor: Colors.light.tint,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
});
