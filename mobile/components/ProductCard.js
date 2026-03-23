import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS } from "../constants/fonts";
import { useWishlist } from "../context/WishlistContext";

export default function ProductCard({ product, onPress }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const isLowStock =
    Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5;
  const isLiked = isWishlisted(product._id);
  const isOnSale = Number(product.salePrice || 0) > 0;
  const rating = Number(product.averageRating || 0).toFixed(1);
  const reviewCount = Number(product.reviewCount || 0);

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onPress}>
      <View>
        <Image
          source={{ uri: product.image || "https://picsum.photos/200" }}
          style={styles.image}
        />
        <View style={styles.badgeRow}>
          <View style={styles.badgeClusterLeft}>
            <View style={styles.badgePrimary}>
              <Text style={styles.badgePrimaryText}>
                {isOnSale ? "Deal đang chạy" : "New Drop"}
              </Text>
            </View>
            {isLiked ? (
              <View style={styles.badgeSaved}>
                <Ionicons name="heart" size={12} color="#b91c1c" />
                <Text style={styles.badgeSavedText}>Đã lưu</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.badgeClusterRight}>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.ratingPillText}>{rating}</Text>
            </View>
            <Pressable
              style={styles.wishlistBtn}
              onPress={() => toggleWishlist(product)}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={18}
                color={isLiked ? "#dc2626" : "#111827"}
              />
            </Pressable>
            {isLowStock ? (
              <View style={styles.badgeWarn}>
                <Text style={styles.badgeWarnText}>Sắp hết hàng</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.imageFooterRow}>
          <View style={styles.imageFooterChip}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={12}
              color="#111827"
            />
            <Text style={styles.imageFooterText}>{reviewCount} review</Text>
          </View>
          {isOnSale ? (
            <View style={styles.imageFooterChipWarm}>
              <Ionicons name="pricetag-outline" size={12} color="#9a3412" />
              <Text style={styles.imageFooterTextWarm}>Có giá ưu đãi</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.category} numberOfLines={1}>
            {product.categoryId?.name || "Fashion"}
          </Text>
          <Text style={styles.stock}>Kho: {Number(product.stock || 0)}</Text>
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>
          {Number(product.salePrice || product.price || 0).toLocaleString()} d
        </Text>
        {product.salePrice ? (
          <Text style={styles.oldPrice}>
            {Number(product.price || 0).toLocaleString()} d
          </Text>
        ) : null}
        <Text style={styles.rating}>
          ★ {Number(product.averageRating || 0).toFixed(1)} (
          {product.reviewCount || 0} đánh giá)
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {product.description || "Sản phẩm demo cho môn học"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  image: { width: "100%", height: 170, backgroundColor: "#f3f4f6" },
  badgeRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  badgeClusterLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  badgeClusterRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  badgePrimary: {
    backgroundColor: "#fff7ed",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgePrimaryText: {
    color: "#c2410c",
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  badgeSaved: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  badgeSavedText: { color: "#b91c1c", fontSize: 11, fontFamily: FONTS.bold },
  badgeWarn: {
    backgroundColor: "rgba(17, 24, 39, 0.88)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  ratingPillText: { color: "#111827", fontSize: 11, fontFamily: FONTS.bold },
  wishlistBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageFooterRow: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  imageFooterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  imageFooterChipWarm: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,247,237,0.96)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  imageFooterText: { color: "#111827", fontSize: 11, fontFamily: FONTS.medium },
  imageFooterTextWarm: {
    color: "#9a3412",
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  badgeWarnText: { color: "#fff", fontSize: 11, fontFamily: FONTS.bold },
  content: { padding: 12, gap: 4 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  category: {
    flex: 1,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#9a3412",
    fontFamily: FONTS.medium,
  },
  stock: { color: "#6b7280", fontSize: 12, fontFamily: FONTS.medium },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    fontFamily: FONTS.bold,
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    fontFamily: FONTS.bold,
  },
  oldPrice: {
    color: "#9ca3af",
    textDecorationLine: "line-through",
    fontFamily: FONTS.regular,
  },
  rating: { color: "#9a3412", fontFamily: FONTS.medium, fontSize: 12 },
  desc: { fontSize: 12, color: "#6b7280", fontFamily: FONTS.regular },
});
