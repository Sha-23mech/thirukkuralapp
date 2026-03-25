import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import Colors from "@/constants/colors";
import data from "@/data/thirukkural.json";

function InfoCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIconContainer}>{icon}</View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : tabBarHeight;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>பற்றி</Text>
        <Text style={styles.headerSubtitle}>About</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <MaterialCommunityIcons name="book-open-page-variant" size={48} color={Colors.light.gold} />
          </View>
          <Text style={styles.heroTitle}>{data.book.title}</Text>
          <Text style={styles.heroSubtitle}>{data.book.titleTransliteration}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>நூல் பற்றிய தகவல்</Text>
          <Text style={styles.sectionTitleEn}>Book Information</Text>

          <InfoCard
            icon={<Ionicons name="person" size={20} color={Colors.light.tint} />}
            title="ஆசிரியர் / Author"
            value={`${data.book.author} (${data.book.authorTransliteration})`}
          />

          <InfoCard
            icon={<MaterialCommunityIcons name="comment-text-outline" size={20} color={Colors.light.tint} />}
            title="உரையாசிரியர் / Commentary by"
            value={`${data.book.commentaryAuthor}`}
          />

          <InfoCard
            icon={<MaterialCommunityIcons name="book-multiple" size={20} color={Colors.light.tint} />}
            title="பால் / Pal (Book)"
            value={`${data.pals[0].name} - ${data.pals[0].meaning}`}
          />

          <InfoCard
            icon={<MaterialCommunityIcons name="bookmark-multiple" size={20} color={Colors.light.tint} />}
            title="அதிகாரம் / Adhikaram"
            value={`${data.pals[0].adhikarams[0].name} - ${data.pals[0].adhikarams[0].meaning}`}
          />

          <InfoCard
            icon={<MaterialCommunityIcons name="format-list-numbered" size={20} color={Colors.light.tint} />}
            title="குறள்கள் எண்ணிக்கை / Total Kurals"
            value={`${data.pals[0].adhikarams[0].kurals.length} குறள்கள் (Kurals)`}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>அறிமுகம்</Text>
          <Text style={styles.sectionTitleEn}>Introduction</Text>
          <View style={styles.introCard}>
            <Text style={styles.introText}>{data.pals[0].adhikarams[0].introduction}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>பொருளடக்கம்</Text>
          <Text style={styles.sectionTitleEn}>Contents</Text>
          {data.pals[0].adhikarams[0].kurals.map((kural) => (
            <View key={kural.number} style={styles.tocItem}>
              <View style={styles.tocNumber}>
                <Text style={styles.tocNumberText}>{kural.number}</Text>
              </View>
              <Text style={styles.tocKural} numberOfLines={1}>
                {kural.tamil.split("\n")[0]}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
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
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 28,
    marginBottom: 20,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: Colors.light.tint,
    letterSpacing: 1,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginTop: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginBottom: 2,
  },
  sectionTitleEn: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginBottom: 12,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  introCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    padding: 16,
  },
  introText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 24,
    textAlign: "justify",
  },
  tocItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    padding: 12,
    marginBottom: 6,
    gap: 12,
  },
  tocNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  tocNumberText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  tocKural: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
  },
});
