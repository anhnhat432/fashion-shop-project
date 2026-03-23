import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { FONTS } from "../constants/fonts";

const paymentStatusMap = {
  PAID: 'Đã thanh toán',
  PENDING: 'Chưa thanh toán',
};

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/orders/my-orders");
      setOrders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được đơn hàng");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const paidCount = orders.filter((item) => item.paymentStatus === "PAID").length;
  const pendingCount = orders.filter((item) => item.paymentStatus !== "PAID").length;

  const renderHeader = () => (
    <View style={styles.headerWrap}>
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroEyebrow}>Order journal</Text>
            <Text style={styles.heroTitle}>Theo dõi từng đơn hàng của bạn.</Text>
          </View>
          <Ionicons name="receipt-outline" size={24} color="#fde68a" />
        </View>
        <Text style={styles.heroSubtitle}>
          Kiểm tra trạng thái giao hàng, thanh toán và mã chuyển khoản mô phỏng trong một màn hình.
        </Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>{orders.length}</Text>
            <Text style={styles.heroStatLabel}>Tổng đơn</Text>
          </View>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>{paidCount}</Text>
            <Text style={styles.heroStatLabel}>Đã thanh toán</Text>
          </View>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>{pendingCount}</Text>
            <Text style={styles.heroStatLabel}>Chờ thanh toán</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={fetchOrders}>
          <Text style={styles.retryText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={orders}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Ionicons name="file-tray-outline" size={34} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
          <Text style={styles.empty}>Khi bạn checkout, lịch sử đơn sẽ xuất hiện ở đây.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.orderCodeWrap}>
              <Text style={styles.codeLabel}>Mã đơn</Text>
              <Text style={styles.code}>#{item._id.slice(-8).toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, item.paymentStatus === "PAID" ? styles.paidBadge : styles.pendingBadge]}>
              <Text style={[styles.statusBadgeText, item.paymentStatus === "PAID" ? styles.paidBadgeText : styles.pendingBadgeText]}>
                {paymentStatusMap[item.paymentStatus] || item.paymentStatus}
              </Text>
            </View>
          </View>

          <View style={styles.timelineWrap}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.status}>Trạng thái đơn: {item.status}</Text>
              <Text style={styles.meta}>Phương thức: {item.paymentMethod}</Text>
              {item.transferReference ? (
                <Text style={styles.meta}>Mã chuyển khoản: {item.transferReference}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.total}>{Number(item.totalAmount || 0).toLocaleString()} đ</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: "#f3f5f7" },
  listContent: { padding: 12, paddingBottom: 24 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#f3f5f7",
  },
  headerWrap: { paddingBottom: 12 },
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  heroEyebrow: {
    color: "#fde68a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  heroTitle: { color: "#fff", fontSize: 24, lineHeight: 32, fontFamily: FONTS.bold },
  heroSubtitle: { color: "#d1d5db", lineHeight: 20, fontFamily: FONTS.regular },
  heroStats: { flexDirection: "row", gap: 10 },
  heroStatCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 12,
  },
  heroStatValue: { color: "#fff", fontFamily: FONTS.bold, fontSize: 18 },
  heroStatLabel: { color: "#cbd5e1", fontSize: 12, fontFamily: FONTS.regular },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    gap: 12,
  },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  orderCodeWrap: { gap: 2 },
  codeLabel: { color: "#9ca3af", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.7, fontFamily: FONTS.medium },
  code: { color: "#111827", fontFamily: FONTS.bold, fontSize: 18 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  paidBadge: { backgroundColor: "#dcfce7" },
  pendingBadge: { backgroundColor: "#fef3c7" },
  statusBadgeText: { fontFamily: FONTS.bold, fontSize: 12 },
  paidBadgeText: { color: "#166534" },
  pendingBadgeText: { color: "#92400e" },
  timelineWrap: { flexDirection: "row", gap: 10 },
  timelineDot: { width: 10, height: 10, borderRadius: 999, marginTop: 6, backgroundColor: "#111827" },
  timelineContent: { flex: 1, gap: 2 },
  status: { color: "#374151", fontFamily: FONTS.medium },
  meta: { color: '#6b7280', fontFamily: FONTS.regular },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { color: "#6b7280", fontFamily: FONTS.regular },
  total: { fontWeight: "700", color: "#111827", fontFamily: FONTS.bold },
  empty: {
    textAlign: "center",
    color: "#6b7280",
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
  muted: { color: "#6b7280", fontFamily: FONTS.regular },
  error: { color: "#b91c1c", textAlign: "center", fontFamily: FONTS.regular },
  retryBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "700", fontFamily: FONTS.bold },
});
