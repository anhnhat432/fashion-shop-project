import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { FONTS } from "../constants/fonts";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const initials = (user?.name || "Khách hàng")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || "KH"}</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.kicker}>Your profile</Text>
          <Text style={styles.name}>{user?.name || "Khách hàng"}</Text>
          <Text style={styles.heroMeta}>{user?.email || "-"}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={18} color="#9a3412" />
          <View style={styles.infoCopy}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || "-"}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color="#9a3412" />
          <View style={styles.infoCopy}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>{user?.phone || "-"}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color="#9a3412" />
          <View style={styles.infoCopy}>
            <Text style={styles.infoLabel}>Địa chỉ</Text>
            <Text style={styles.infoValue}>{user?.address || "-"}</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={styles.actionCard}
        onPress={() => navigation.getParent()?.navigate("OrderHistory")}
      >
        <View style={styles.actionIconWrap}>
          <Ionicons name="receipt-outline" size={20} color="#111827" />
        </View>
        <View style={styles.actionCopy}>
          <Text style={styles.actionTitle}>Lịch sử đơn hàng</Text>
          <Text style={styles.actionSubtitle}>Theo dõi các đơn đã đặt và trạng thái thanh toán</Text>
        </View>
      </Pressable>

      <Pressable style={styles.btnDanger} onPress={logout}>
        <Text style={styles.btnDangerText}>Đăng xuất</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10, backgroundColor: "#f3f5f7" },
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 22, fontFamily: FONTS.bold },
  heroCopy: { flex: 1, gap: 2 },
  kicker: {
    color: "#fde68a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  name: {
    fontSize: 22,
    color: "#fff",
    fontFamily: FONTS.bold,
  },
  heroMeta: { color: "#d1d5db", fontFamily: FONTS.regular },
  infoCard: { backgroundColor: "#fffaf5", borderRadius: 18, padding: 14, gap: 14, borderWidth: 1, borderColor: "#eeded0" },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  infoCopy: { flex: 1, gap: 2 },
  infoLabel: { color: "#9a3412", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, fontFamily: FONTS.medium },
  infoValue: { color: "#111827", fontFamily: FONTS.medium },
  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#f8e7d7",
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopy: { flex: 1 },
  actionTitle: { color: "#111827", fontFamily: FONTS.bold },
  actionSubtitle: { color: "#6b7280", marginTop: 2, fontFamily: FONTS.regular },
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
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  btnDangerText: {
    color: "#b91c1c",
    fontWeight: "700",
    fontFamily: FONTS.bold,
  },
});
