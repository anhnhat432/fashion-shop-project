import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import api from "../services/api";
import { FONTS } from "../constants/fonts";

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
      data={orders}
      keyExtractor={(item) => item._id}
      ListEmptyComponent={
        <Text style={styles.empty}>Chưa có đơn hàng nào</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.code}>Mã đơn: {item._id}</Text>
          <Text style={styles.status}>Trạng thái: {item.status}</Text>
          <Text style={styles.total}>
            Tổng: {Number(item.totalAmount || 0).toLocaleString()} đ
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, padding: 12, backgroundColor: "#f3f5f7" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#f3f5f7",
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  code: { fontWeight: "700", color: "#111827", fontFamily: FONTS.bold },
  status: { marginTop: 2, color: "#374151", fontFamily: FONTS.regular },
  total: { marginTop: 4, fontWeight: "700", fontFamily: FONTS.bold },
  empty: {
    textAlign: "center",
    marginTop: 26,
    color: "#6b7280",
    fontFamily: FONTS.regular,
  },
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
