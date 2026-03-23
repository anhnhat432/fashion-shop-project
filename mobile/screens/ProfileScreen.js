import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { FONTS } from "../constants/fonts";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name || "Khách hàng"}</Text>
        <Text style={styles.meta}>Email: {user?.email || "-"}</Text>
        <Text style={styles.meta}>SĐT: {user?.phone || "-"}</Text>
        <Text style={styles.meta}>Địa chỉ: {user?.address || "-"}</Text>
      </View>

      <Pressable
        style={styles.btnSecondary}
        onPress={() => navigation.navigate("OrderHistory")}
      >
        <Text style={styles.btnSecondaryText}>Lịch sử đơn hàng</Text>
      </Pressable>

      <Pressable style={styles.btnDanger} onPress={logout}>
        <Text style={styles.btnDangerText}>Đăng xuất</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10, backgroundColor: "#f3f5f7" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, gap: 6 },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    fontFamily: FONTS.bold,
  },
  meta: { color: "#374151", fontFamily: FONTS.regular },
  btnSecondary: {
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  btnSecondaryText: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: FONTS.bold,
  },
  btnDanger: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  btnDangerText: {
    color: "#b91c1c",
    fontWeight: "700",
    fontFamily: FONTS.bold,
  },
});
