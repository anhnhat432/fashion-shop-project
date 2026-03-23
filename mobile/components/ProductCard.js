import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FONTS } from "../constants/fonts";

export default function ProductCard({ product, onPress }) {
  const isLowStock =
    Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5;

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onPress}>
      <View>
        <Image
          source={{ uri: product.image || "https://picsum.photos/200" }}
          style={styles.image}
        />
        <View style={styles.badgeRow}>
          <View style={styles.badgePrimary}>
            <Text style={styles.badgePrimaryText}>New Drop</Text>
          </View>
          {isLowStock ? (
            <View style={styles.badgeWarn}>
              <Text style={styles.badgeWarnText}>Sắp hết hàng</Text>
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
          {Number(product.price || 0).toLocaleString()} d
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
  },
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
  badgeWarn: {
    backgroundColor: "rgba(17, 24, 39, 0.88)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
  desc: { fontSize: 12, color: "#6b7280", fontFamily: FONTS.regular },
});
