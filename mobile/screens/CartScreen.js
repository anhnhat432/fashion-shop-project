import React from "react";
import { Pressable, FlatList, StyleSheet, Text, View } from "react-native";
import { useCart } from "../context/CartContext";
import { FONTS } from "../constants/fonts";

export default function CartScreen({ navigation }) {
  const { cartItems, updateQty, removeItem } = useCart();
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(_, idx) => String(idx)}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Giỏ hàng trống. Hãy thêm sản phẩm nhé!
          </Text>
        }
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.size || "-"} / {item.color || "-"}
            </Text>
            <Text>
              {Number(item.price).toLocaleString()} d x {item.quantity}
            </Text>
            <View style={styles.row}>
              <Pressable
                style={styles.smallBtn}
                onPress={() => updateQty(index, -1)}
              >
                <Text>-</Text>
              </Pressable>
              <Pressable
                style={styles.smallBtn}
                onPress={() => updateQty(index, 1)}
              >
                <Text>+</Text>
              </Pressable>
              <Pressable
                style={[styles.smallBtn, styles.danger]}
                onPress={() => removeItem(index)}
              >
                <Text style={{ color: "#b91c1c", fontFamily: FONTS.regular }}>
                  Xóa
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <Text style={styles.total}>Tổng: {total.toLocaleString()} đ</Text>
        <Pressable
          style={[styles.checkoutBtn, !cartItems.length && styles.disabled]}
          onPress={() => navigation.navigate("Checkout")}
          disabled={!cartItems.length}
        >
          <Text style={styles.checkoutText}>Tiến hành thanh toán</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#f3f5f7" },
  item: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  name: { fontWeight: "700", marginBottom: 2, fontFamily: FONTS.bold },
  meta: { color: "#666", marginBottom: 2, fontFamily: FONTS.regular },
  row: { flexDirection: "row", gap: 8, marginTop: 8 },
  smallBtn: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  danger: { backgroundColor: "#fee2e2" },
  footer: { borderTopWidth: 1, borderTopColor: "#ddd", paddingTop: 12, gap: 8 },
  total: { fontSize: 18, fontWeight: "700", fontFamily: FONTS.bold },
  checkoutBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontWeight: "700", fontFamily: FONTS.bold },
  disabled: { opacity: 0.6 },
  empty: {
    textAlign: "center",
    marginTop: 24,
    color: "#666",
    fontFamily: FONTS.regular,
  },
});
