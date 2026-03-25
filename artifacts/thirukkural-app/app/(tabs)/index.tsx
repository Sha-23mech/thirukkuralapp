import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useRef, useCallback } from "react";
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import data from "@/data/thirukkural.json";

type Kural = (typeof data.pals)[0]["adhikarams"][0]["kurals"][0];

function KuralCard({ kural, index }: { kural: Kural; index: number }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/kural/[number]", params: { number: kural.number } });
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [styles.kuralCard, pressed && { opacity: 0.95 }]}
      >
        <View style={styles.kuralCardHeader}>
          <View style={styles.kuralNumberBadge}>
            <Text style={styles.kuralNumberText}>{kural.number}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.light.textMuted} />
        </View>

        <View style={styles.quoteContainer}>
          <MaterialCommunityIcons
            name="format-quote-open"
            size={20}
            color={Colors.light.gold}
            style={styles.quoteIcon}
          />
          <Text style={styles.kuralTamilText}>{kural.tamil}</Text>
        </View>

        <View style={styles.transliterationRow}>
          <Text style={styles.kuralTransliteration} numberOfLines={1}>
            {kural.transliteration.split("\n")[0]}...
          </Text>
        </View>

        <View style={styles.kuralDivider} />

        <Text style={styles.kuralCommentaryPreview} numberOfLines={2}>
          {kural.commentary}
        </Text>

        <View style={styles.readMoreRow}>
          <Text style={styles.readMoreText}>மேலும் வாசிக்க</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.light.tint} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : tabBarHeight;

  const kurals = data.pals[0].adhikarams[0].kurals;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>திருக்குறள்</Text>
          <Text style={styles.headerSubtitle}>Thirukkural • கடவுள் வாழ்த்து</Text>
        </View>
        <View style={styles.headerBadge}>
          <MaterialCommunityIcons name="book-open-variant" size={20} color={Colors.light.gold} />
        </View>
      </View>

      <View style={styles.adhikaramBanner}>
        <Text style={styles.adhikaramLabel}>அதிகாரம் 1</Text>
        <Text style={styles.adhikaramName}>{data.pals[0].adhikarams[0].name}</Text>
        <Text style={styles.adhikaramMeaning}>{data.pals[0].adhikarams[0].meaning}</Text>
      </View>

      <FlatList
        data={kurals}
        keyExtractor={(item) => item.number.toString()}
        renderItem={({ item, index }) => <KuralCard kural={item} index={index} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding + 16 }]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.separator,
    backgroundColor: Colors.light.background,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
  },
  adhikaramBanner: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  adhikaramLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  adhikaramName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginTop: 2,
  },
  adhikaramMeaning: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  kuralCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    padding: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  kuralCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  kuralNumberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
  },
  kuralNumberText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.light.tint,
  },
  quoteContainer: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.gold,
  },
  quoteIcon: {
    marginBottom: 4,
  },
  kuralTamilText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    lineHeight: 30,
  },
  transliterationRow: {
    marginBottom: 12,
  },
  kuralTransliteration: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    fontStyle: "italic",
  },
  kuralDivider: {
    height: 1,
    backgroundColor: Colors.light.separator,
    marginBottom: 12,
  },
  kuralCommentaryPreview: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: 10,
  },
  readMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readMoreText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.tint,
  },
});
