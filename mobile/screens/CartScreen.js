import React from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../context/CartContext";
import { FONTS } from "../constants/fonts";

export default function CartScreen({ navigation }) {
  const { cartItems, updateQty, removeItem } = useCart();
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shippingFee = subtotal >= 499000 ? 0 : 30000;
  const total = subtotal + shippingFee;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const renderHeader = () => (
    <View style={styles.headerWrap}>
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>Bag overview</Text>
        </View>
        <Text style={styles.heroTitle}>
          Giỏ đồ của bạn đã sẵn sàng để checkout.
        </Text>
        <Text style={styles.heroSubtitle}>
          Kiểm tra số lượng, phối màu và tổng đơn trước khi xác nhận thanh toán.
        </Text>
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>{itemCount}</Text>
            <Text style={styles.heroStatLabel}>Sản phẩm</Text>
          </View>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>
              {subtotal.toLocaleString()} đ
            </Text>
            <Text style={styles.heroStatLabel}>Tạm tính</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(_, idx) => String(idx)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons name="bag-handle-outline" size={34} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
            <Text style={styles.emptyText}>
              Thêm vài item nổi bật để bắt đầu đơn hàng mới.
            </Text>
            <Pressable
              style={styles.browseBtn}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.browseBtnText}>Quay lại mua sắm</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Image
              source={{ uri: item.image || "https://picsum.photos/200" }}
              style={styles.image}
            />
            <View style={styles.itemContent}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.size || "One size"} • {item.color || "Neutral"}
              </Text>
              <Text style={styles.lineTotal}>
                {Number(item.price).toLocaleString()} đ x {item.quantity}
              </Text>
              {Number.isFinite(Number(item.availableStock)) ? (
                <Text style={styles.stockNote}>
                  Còn tối đa {Number(item.availableStock)} sản phẩm cho lựa chọn
                  này
                </Text>
              ) : null}
              <View style={styles.row}>
                <View style={styles.qtyWrap}>
                  <Pressable
                    style={styles.smallBtn}
                    onPress={() => updateQty(index, -1)}
                  >
                    <Text style={styles.qtyText}>-</Text>
                  </Pressable>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <Pressable
                    style={[
                      styles.smallBtn,
                      Number.isFinite(Number(item.availableStock)) &&
                      item.quantity >= Number(item.availableStock)
                        ? styles.smallBtnDisabled
                        : null,
                    ]}
                    onPress={() => updateQty(index, 1)}
                    disabled={
                      Number.isFinite(Number(item.availableStock)) &&
                      item.quantity >= Number(item.availableStock)
                    }
                  >
                    <Text style={styles.qtyText}>+</Text>
                  </Pressable>
                </View>
                <Pressable
                  style={[styles.smallBtn, styles.danger]}
                  onPress={() => removeItem(index)}
                >
                  <Text style={styles.removeText}>Xóa</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tạm tính</Text>
          <Text style={styles.summaryValue}>{subtotal.toLocaleString()} đ</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
          <Text style={styles.summaryValue}>
            {shippingFee.toLocaleString()} đ
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.total}>Tổng cộng</Text>
          <Text style={styles.total}>{total.toLocaleString()} đ</Text>
        </View>
        <Pressable
          style={[styles.checkoutBtn, !cartItems.length && styles.disabled]}
          onPress={() => navigation.getParent()?.navigate("Checkout")}
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
  listContent: { paddingBottom: 12 },
  headerWrap: { paddingBottom: 12 },
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  heroBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroBadgeText: {
    color: "#fde68a",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontFamily: FONTS.bold,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 32,
    fontFamily: FONTS.bold,
  },
  heroSubtitle: { color: "#d1d5db", lineHeight: 20, fontFamily: FONTS.regular },
  heroStatsRow: { flexDirection: "row", gap: 10 },
  heroStatCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  heroStatValue: { color: "#fff", fontFamily: FONTS.bold },
  heroStatLabel: { color: "#cbd5e1", fontSize: 12, fontFamily: FONTS.regular },
  item: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  image: {
    width: 92,
    height: 110,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
  },
  itemContent: { flex: 1, gap: 4 },
  name: {
    fontWeight: "700",
    marginBottom: 2,
    color: "#111827",
    fontFamily: FONTS.bold,
  },
  meta: { color: "#6b7280", marginBottom: 2, fontFamily: FONTS.regular },
  lineTotal: { color: "#111827", fontFamily: FONTS.medium },
  stockNote: { color: "#6b7280", fontFamily: FONTS.regular },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  qtyWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  smallBtn: {
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  smallBtnDisabled: { opacity: 0.45 },
  qtyText: { color: "#111827", fontFamily: FONTS.bold, fontSize: 16 },
  qtyValue: {
    minWidth: 18,
    textAlign: "center",
    color: "#111827",
    fontFamily: FONTS.bold,
  },
  danger: { backgroundColor: "#fee2e2" },
  removeText: { color: "#b91c1c", fontFamily: FONTS.medium },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 14,
    gap: 8,
    backgroundColor: "#f3f5f7",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { color: "#6b7280", fontFamily: FONTS.regular },
  summaryValue: { color: "#111827", fontFamily: FONTS.medium },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
    marginTop: 4,
  },
  total: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    fontFamily: FONTS.bold,
  },
  checkoutBtn: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 14,
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
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  emptyTitle: { color: "#111827", fontSize: 18, fontFamily: FONTS.bold },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    fontFamily: FONTS.regular,
  },
  browseBtn: {
    marginTop: 8,
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  browseBtnText: { color: "#fff", fontFamily: FONTS.bold },
});
