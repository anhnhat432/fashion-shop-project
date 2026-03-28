import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProductCard from "../components/ProductCard";
import { useWishlist } from "../context/WishlistContext";
import { FONTS } from "../constants/fonts";

export default function WishlistScreen({ navigation }) {
  const { wishlistItems, wishlistCount, loading, refreshWishlist } =
    useWishlist();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const insight = useMemo(() => {
    const lowStockCount = wishlistItems.filter(
      (item) => Number(item.stock || 0) > 0 && Number(item.stock || 0) <= 5,
    ).length;
    const saleCount = wishlistItems.filter(
      (item) => Number(item.salePrice || 0) > 0,
    ).length;

    return { lowStockCount, saleCount };
  }, [wishlistItems]);
  const filteredItems = useMemo(() => {
    if (activeFilter === "SALE") {
      return wishlistItems.filter((item) => Number(item.salePrice || 0) > 0);
    }

    if (activeFilter === "LOW_STOCK") {
      return wishlistItems.filter((item) => {
        const stock = Number(item.stock || 0);
        return stock > 0 && stock <= 5;
      });
    }

    return wishlistItems;
  }, [activeFilter, wishlistItems]);
  const emptyLabel =
    activeFilter === "SALE"
      ? "Chưa có sản phẩm ưu đãi trong danh sách yêu thích"
      : activeFilter === "LOW_STOCK"
        ? "Chưa có sản phẩm sắp hết hàng trong danh sách yêu thích"
        : "Chưa có sản phẩm yêu thích";
  const activeFilterShortLabel =
    activeFilter === "SALE"
      ? "Ưu đãi"
      : activeFilter === "LOW_STOCK"
        ? "Sắp hết"
        : "Tất cả";

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={refreshWishlist}
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <Text style={styles.eyebrow}>Đã lưu</Text>
                <View style={styles.activeFilterBadge}>
                  <Text style={styles.activeFilterBadgeEyebrow}>Bộ lọc</Text>
                  <Text style={styles.activeFilterBadgeText}>
                    {activeFilterShortLabel}
                  </Text>
                </View>
              </View>
              <Text style={styles.title}>Sản phẩm yêu thích của bạn</Text>
              <Text style={styles.subtitle}>
                Lưu lại những món bạn muốn cân nhắc trước khi thêm vào giỏ.
              </Text>
              <View style={styles.heroMetrics}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{wishlistCount}</Text>
                  <Text style={styles.metricLabel}>Sản phẩm đã lưu</Text>
                </View>
                <View style={styles.metricCardLight}>
                  <Text style={styles.metricValueDark}>
                    {insight.saleCount}
                  </Text>
                  <Text style={styles.metricLabelDark}>Đang ưu đãi</Text>
                </View>
                <View style={styles.metricCardLight}>
                  <Text style={styles.metricValueDark}>
                    {insight.lowStockCount}
                  </Text>
                  <Text style={styles.metricLabelDark}>Sắp hết hàng</Text>
                </View>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#4f46e5" />
                <Text style={styles.loadingText}>
                  Đang đồng bộ danh sách yêu thích...
                </Text>
              </View>
            ) : null}

            <View style={styles.filterRow}>
              {[
                { key: "ALL", label: `Tất cả (${wishlistCount})` },
                { key: "SALE", label: `Đang ưu đãi (${insight.saleCount})` },
                {
                  key: "LOW_STOCK",
                  label: `Sắp hết (${insight.lowStockCount})`,
                },
              ].map((filter) => {
                const isActive = activeFilter === filter.key;
                return (
                  <Pressable
                    key={filter.key}
                    style={[
                      styles.filterChip,
                      isActive && styles.filterChipActive,
                    ]}
                    onPress={() => setActiveFilter(filter.key)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isActive && styles.filterChipTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons name="heart-outline" size={36} color="#9ca3af" />
            <Text style={styles.emptyTitle}>{emptyLabel}</Text>
            <Text style={styles.emptyText}>
              {activeFilter === "ALL"
                ? "Nhấn tim ở sản phẩm để lưu nhanh vào danh sách yêu thích."
                : "Thử chuyển bộ lọc khác hoặc thêm sản phẩm phù hợp vào danh sách yêu thích."}
            </Text>
            <Pressable
              style={styles.browseBtn}
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "Home" })
              }
            >
              <Text style={styles.browseText}>Khám phá sản phẩm</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() =>
              navigation.replace("ProductDetail", { productId: item._id })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9", padding: 12 },
  listContent: { paddingBottom: 24 },
  heroCard: {
    backgroundColor: "#1e1b4b",
    borderRadius: 24,
    padding: 18,
    gap: 10,
    marginBottom: 12,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  eyebrow: {
    color: "#a5b4fc",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  activeFilterBadge: {
    backgroundColor: "rgba(165,180,252,0.2)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignItems: "flex-end",
  },
  activeFilterBadgeEyebrow: {
    color: "#c7d2fe",
    fontSize: 10,
    fontFamily: FONTS.regular,
  },
  activeFilterBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  title: { color: "#fff", fontSize: 24, fontFamily: FONTS.bold },
  subtitle: { color: "#c7d2fe", fontFamily: FONTS.regular, lineHeight: 20 },
  heroMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  metricCard: {
    backgroundColor: "rgba(99,102,241,0.85)",
    borderRadius: 18,
    padding: 12,
    minWidth: 110,
    gap: 2,
  },
  metricCardLight: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 12,
    minWidth: 110,
    gap: 2,
  },
  metricValue: { color: "#fff", fontSize: 22, fontFamily: FONTS.bold },
  metricLabel: { color: "#c7d2fe", fontFamily: FONTS.medium, fontSize: 12 },
  metricValueDark: { color: "#1e293b", fontSize: 22, fontFamily: FONTS.bold },
  metricLabelDark: { color: "#6b7280", fontFamily: FONTS.medium, fontSize: 12 },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  loadingText: { color: "#6b7280", fontFamily: FONTS.medium },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterChipActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  filterChipText: { color: "#374151", fontFamily: FONTS.medium, fontSize: 12 },
  filterChipTextActive: { color: "#fff" },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyTitle: { color: "#1e293b", fontSize: 18, fontFamily: FONTS.bold },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    fontFamily: FONTS.regular,
  },
  browseBtn: {
    marginTop: 8,
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  browseText: { color: "#fff", fontFamily: FONTS.bold },
});
