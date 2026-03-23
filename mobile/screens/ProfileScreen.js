import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { FONTS } from "../constants/fonts";

export default function ProfileScreen({ navigation }) {
  const { user, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
  }, [user]);

  const initials = (user?.name || "Khách hàng")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleSave = async () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      return Alert.alert("Lỗi", "Họ tên phải có ít nhất 2 ký tự");
    }

    const normalizedPhone = form.phone.trim().replace(/\D/g, "");
    if (
      form.phone.trim() &&
      (normalizedPhone.length < 9 || normalizedPhone.length > 11)
    ) {
      return Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
    }

    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });
      Alert.alert("Thành công", "Thông tin tài khoản đã được cập nhật");
    } catch (error) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể cập nhật hồ sơ",
      );
    } finally {
      setSaving(false);
    }
  };

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
        <View style={styles.infoStaticRow}>
          <Ionicons name="mail-outline" size={18} color="#9a3412" />
          <View style={styles.infoCopy}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || "-"}</Text>
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.infoLabel}>Họ tên</Text>
          <View style={styles.inputShell}>
            <Ionicons name="person-outline" size={18} color="#9a3412" />
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, name: value }))
              }
              placeholder="Họ tên"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.infoLabel}>Số điện thoại</Text>
          <View style={styles.inputShell}>
            <Ionicons name="call-outline" size={18} color="#9a3412" />
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, phone: value }))
              }
              placeholder="Số điện thoại"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.infoLabel}>Địa chỉ</Text>
          <View style={[styles.inputShell, styles.inputShellMultiline]}>
            <Ionicons name="location-outline" size={18} color="#9a3412" />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={form.address}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, address: value }))
              }
              placeholder="Địa chỉ nhận hàng"
              placeholderTextColor="#9ca3af"
              multiline
            />
          </View>
        </View>

        <Pressable
          style={[styles.btnPrimary, saving && styles.disabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>Lưu thay đổi</Text>
          )}
        </Pressable>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color="#9a3412" />
          <View style={styles.infoCopy}>
            <Text style={styles.infoLabel}>Trạng thái tài khoản</Text>
            <Text style={styles.infoValue}>
              Sẵn sàng đặt hàng và theo dõi đơn
            </Text>
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
          <Text style={styles.actionSubtitle}>
            Theo dõi các đơn đã đặt và trạng thái thanh toán
          </Text>
        </View>
      </Pressable>

      <Pressable
        style={styles.actionCard}
        onPress={() => navigation.getParent()?.navigate("Wishlist")}
      >
        <View style={styles.actionIconWrap}>
          <Ionicons name="heart-outline" size={20} color="#111827" />
        </View>
        <View style={styles.actionCopy}>
          <Text style={styles.actionTitle}>Wishlist</Text>
          <Text style={styles.actionSubtitle}>
            Lưu lại các sản phẩm muốn mua sau hoặc đang cân nhắc
          </Text>
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
  infoCard: {
    backgroundColor: "#fffaf5",
    borderRadius: 18,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: "#eeded0",
  },
  infoStaticRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  infoCopy: { flex: 1, gap: 2 },
  infoLabel: {
    color: "#9a3412",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontFamily: FONTS.medium,
  },
  infoValue: { color: "#111827", fontFamily: FONTS.medium },
  fieldWrap: { gap: 8 },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#ead9ca",
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  inputShellMultiline: { alignItems: "flex-start", paddingVertical: 12 },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: "#111827",
    fontFamily: FONTS.regular,
  },
  multilineInput: { minHeight: 72, textAlignVertical: "top" },
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
  btnPrimary: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: FONTS.bold,
  },
  disabled: { opacity: 0.6 },
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
