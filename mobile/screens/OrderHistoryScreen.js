import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import SkeletonBlock from "../components/SkeletonBlock";
import { FONTS } from "../constants/fonts";

const paymentStatusMap = {
  PAID: "Đã thanh toán",
  PENDING: "Chưa thanh toán",
};

const paymentMethodMap = {
  COD: "COD",
  BANK_TRANSFER: "Chuyển khoản",
};

const orderStatusMap = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

const STATUS_FILTERS = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "DELIVERED", label: "Đã giao" },
  { key: "CANCELLED", label: "Đã hủy" },
];

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const revealAnim = useRef(new Animated.Value(0)).current;

  const fetchOrders = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const res = await api.get("/orders/my-orders");
      setOrders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được đơn hàng");
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => fetchOrders(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!loading) {
      revealAnim.setValue(0);
      Animated.timing(revealAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, revealAnim]);

  const paidCount = orders.filter((item) => item.paymentStatus === "PAID").length;
  const pendingCount = orders.filter((item) => item.paymentStatus !== "PAID").length;
  const displayedOrders = statusFilter === "ALL"
    ? orders
    : orders.filter((item) => item.status === statusFilter);

  const cancelOrder = async (orderId) => {
    Alert.alert(
      "Xác nhận hủy đơn",
      "Bạn có chắc muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy đơn",
          style: "destructive",
          onPress: async () => {
            setCancellingId(orderId);
            try {
              await api.put(`/orders/${orderId}/cancel`);
              await fetchOrders();
            } catch (err) {
              setError(err.response?.data?.message || "Không thể hủy đơn hàng");
            } finally {
              setCancellingId("");
            }
          },
        },
      ],
    );
  };

  const renderHeader = () => (
    <View style={styles.headerWrap}>
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroEyebrow}>Nhật ký đơn hàng</Text>
            <Text style={styles.heroTitle}>
              Theo dõi từng đơn hàng của bạn.
            </Text>
          </View>
          <Ionicons name="receipt-outline" size={24} color="#a5b4fc" />
        </View>
        <Text style={styles.heroSubtitle}>
          Kiểm tra trạng thái giao hàng, thanh toán và mã chuyển khoản mô phỏng
          trong một màn hình.
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {STATUS_FILTERS.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.filterChip, statusFilter === f.key && styles.filterChipActive]}
            onPress={() => setStatusFilter(f.key)}
          >
            <Text style={[styles.filterChipText, statusFilter === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingWrap}>
      <View style={styles.loadingHero}>
        <SkeletonBlock style={styles.loadingTitle} />
        <SkeletonBlock style={styles.loadingSubtitle} />
        <View style={styles.loadingStatRow}>
          <SkeletonBlock style={styles.loadingStatCard} />
          <SkeletonBlock style={styles.loadingStatCard} />
          <SkeletonBlock style={styles.loadingStatCard} />
        </View>
      </View>
      <SkeletonBlock style={styles.loadingCard} />
      <SkeletonBlock style={styles.loadingCard} />
    </View>
  );

  if (loading) {
    return renderLoadingState();
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
    <Animated.View
      style={{
        flex: 1,
        opacity: revealAnim,
        transform: [
          {
            translateY: revealAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [12, 0],
            }),
          },
        ],
      }}
    >
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={displayedOrders}
        keyExtractor={(item) => item._id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons name="file-tray-outline" size={34} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
            <Text style={styles.empty}>
              Khi bạn thanh toán, lịch sử đơn sẽ xuất hiện ở đây.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.orderCodeWrap}>
                <Text style={styles.codeLabel}>Mã đơn</Text>
                <Text style={styles.code}>
                  #{item._id.slice(-8).toUpperCase()}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  item.paymentStatus === "PAID"
                    ? styles.paidBadge
                    : styles.pendingBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    item.paymentStatus === "PAID"
                      ? styles.paidBadgeText
                      : styles.pendingBadgeText,
                  ]}
                >
                  {paymentStatusMap[item.paymentStatus] || item.paymentStatus}
                </Text>
              </View>
            </View>

            {item.status === "CANCELLED" ? (
              <View style={styles.cancelledRow}>
                <Ionicons name="close-circle" size={16} color="#ef4444" />
                <Text style={styles.cancelledText}>Đơn hàng đã bị hủy</Text>
              </View>
            ) : (
              <View style={styles.stepperWrap}>
                {[
                  { key: "PENDING", label: "Chờ xác\nnhận", icon: "time-outline" },
                  { key: "CONFIRMED", label: "Đã xác\nnhận", icon: "checkmark-circle-outline" },
                  { key: "SHIPPING", label: "Đang\ngiao", icon: "bicycle-outline" },
                  { key: "DELIVERED", label: "Đã\ngiao", icon: "bag-check-outline" },
                ].map((step, idx) => {
                  const STEP_ORDER = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED"];
                  const currentIdx = STEP_ORDER.indexOf(item.status);
                  const done = currentIdx >= idx;
                  return (
                    <React.Fragment key={step.key}>
                      {idx > 0 && (
                        <View style={[styles.stepLine, done && styles.stepLineDone]} />
                      )}
                      <View style={styles.stepNode}>
                        <View style={[styles.stepCircle, done && styles.stepCircleDone]}>
                          <Ionicons
                            name={step.icon}
                            size={14}
                            color={done ? "#fff" : "#94a3b8"}
                          />
                        </View>
                        <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>
                          {step.label}
                        </Text>
                      </View>
                    </React.Fragment>
                  );
                })}
              </View>
            )}
            <View style={styles.metaRow}>
              <Text style={styles.meta}>
                Phương thức: {paymentMethodMap[item.paymentMethod] || item.paymentMethod}
              </Text>
              {item.transferReference ? (
                <Text style={styles.meta}>
                  Mã CK: {item.transferReference}
                </Text>
              ) : null}
            </View>

            {item.items?.length ? (
              <View style={styles.itemsWrap}>
                {item.items.map((orderItem, index) => (
                  <View
                    key={`${orderItem.productId}-${index}`}
                    style={styles.orderItemRow}
                  >
                    <View style={styles.orderItemContent}>
                      <Text style={styles.orderItemName} numberOfLines={1}>
                        {orderItem.name}
                      </Text>
                      <Text style={styles.orderItemMeta}>
                        {orderItem.size || "Một cỡ"} •{" "}
                        {orderItem.color || "Trung tính"} • x{orderItem.quantity}
                      </Text>
                    </View>
                    <Text style={styles.orderItemPrice}>
                      {Number(orderItem.price || 0).toLocaleString()} đ
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.cardFooter}>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.total}>
                {Number(item.totalAmount || 0).toLocaleString()} đ
              </Text>
            </View>

            {item.status === "PENDING" ? (
              <Pressable
                style={[
                  styles.cancelBtn,
                  cancellingId === item._id && styles.cancelBtnDisabled,
                ]}
                onPress={() => cancelOrder(item._id)}
                disabled={cancellingId === item._id}
              >
                <Text style={styles.cancelBtnText}>
                  {cancellingId === item._id
                    ? "Đang hủy đơn..."
                    : "Hủy đơn hàng"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        )}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: "#f1f5f9" },
  listContent: { padding: 12, paddingBottom: 24 },
  loadingWrap: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 12,
    gap: 10,
  },
  loadingHero: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  loadingTitle: { width: "78%", height: 30, borderRadius: 12 },
  loadingSubtitle: { width: "100%", height: 18, borderRadius: 10 },
  loadingStatRow: { flexDirection: "row", gap: 10 },
  loadingStatCard: { flex: 1, height: 74, borderRadius: 16 },
  loadingCard: { width: "100%", height: 150, borderRadius: 18 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#f1f5f9",
  },
  headerWrap: { paddingBottom: 12 },
  filterScroll: { flexDirection: "row", gap: 8, paddingHorizontal: 0, paddingVertical: 10 },
  filterChip: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterChipActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  filterChipText: { color: "#374151", fontFamily: FONTS.medium, fontSize: 13 },
  filterChipTextActive: { color: "#fff", fontFamily: FONTS.bold },
  heroCard: {
    backgroundColor: "#1e1b4b",
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  heroEyebrow: {
    color: "#a5b4fc",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 32,
    fontFamily: FONTS.bold,
  },
  heroSubtitle: { color: "#c7d2fe", lineHeight: 20, fontFamily: FONTS.regular },
  heroStats: { flexDirection: "row", gap: 10 },
  heroStatCard: {
    flex: 1,
    backgroundColor: "rgba(99,102,241,0.18)",
    borderRadius: 16,
    padding: 12,
  },
  heroStatValue: { color: "#fff", fontFamily: FONTS.bold, fontSize: 18 },
  heroStatLabel: { color: "#c7d2fe", fontSize: 12, fontFamily: FONTS.regular },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    gap: 12,
  },
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  orderCodeWrap: { gap: 2 },
  codeLabel: {
    color: "#9ca3af",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontFamily: FONTS.medium,
  },
  code: { color: "#1e293b", fontFamily: FONTS.bold, fontSize: 18 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  paidBadge: { backgroundColor: "#dcfce7" },
  pendingBadge: { backgroundColor: "#fef3c7" },
  statusBadgeText: { fontFamily: FONTS.bold, fontSize: 12 },
  paidBadgeText: { color: "#166534" },
  pendingBadgeText: { color: "#92400e" },
  stepperWrap: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 4 },
  stepNode: { alignItems: "center", gap: 4, width: 52 },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleDone: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  stepLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontFamily: FONTS.regular,
    textAlign: "center",
    lineHeight: 13,
  },
  stepLabelDone: { color: "#4f46e5", fontFamily: FONTS.medium },
  stepLine: { flex: 1, height: 1.5, backgroundColor: "#e2e8f0", marginTop: 14 },
  stepLineDone: { backgroundColor: "#4f46e5" },
  cancelledRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6 },
  cancelledText: { color: "#ef4444", fontFamily: FONTS.medium, fontSize: 13 },
  metaRow: { gap: 2 },
  meta: { color: "#6b7280", fontFamily: FONTS.regular },
  itemsWrap: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 10,
    gap: 8,
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  orderItemContent: { flex: 1, gap: 2 },
  orderItemName: { color: "#1e293b", fontFamily: FONTS.medium },
  orderItemMeta: { color: "#6b7280", fontFamily: FONTS.regular, fontSize: 12 },
  orderItemPrice: { color: "#1e293b", fontFamily: FONTS.bold },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { color: "#6b7280", fontFamily: FONTS.regular },
  total: { fontWeight: "700", color: "#1e293b", fontFamily: FONTS.bold },
  cancelBtn: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnDisabled: { opacity: 0.6 },
  cancelBtnText: { color: "#b91c1c", fontFamily: FONTS.bold },
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
  emptyTitle: { color: "#1e293b", fontSize: 18, fontFamily: FONTS.bold },
  muted: { color: "#6b7280", fontFamily: FONTS.regular },
  error: { color: "#b91c1c", textAlign: "center", fontFamily: FONTS.regular },
  retryBtn: {
    backgroundColor: "#1e1b4b",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "700", fontFamily: FONTS.bold },
});
