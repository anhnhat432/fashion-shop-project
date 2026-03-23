import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { FONTS } from "../constants/fonts";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: form.phone.trim(),
      address: form.address.trim(),
    };

    if (!payload.name || !payload.email || !payload.password)
      return Alert.alert("Lỗi", "Tên, email, mật khẩu là bắt buộc");
    if (!payload.email.includes("@"))
      return Alert.alert("Lỗi", "Email không hợp lệ");
    if (payload.password.length < 6)
      return Alert.alert("Lỗi", "Mật khẩu tối thiểu 6 ký tự");
    if (payload.phone && payload.phone.replace(/\D/g, "").length < 9)
      return Alert.alert("Lỗi", "Số điện thoại cần tối thiểu 9 số");

    setLoading(true);
    try {
      await register(payload);
    } catch (error) {
      Alert.alert("Lỗi", error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name", label: "Họ tên", icon: "person-outline" },
    { key: "email", label: "Email", icon: "mail-outline", keyboardType: "email-address" },
    { key: "password", label: "Mật khẩu", icon: "lock-closed-outline", secureTextEntry: true },
    { key: "phone", label: "Số điện thoại", icon: "call-outline", keyboardType: "phone-pad" },
    { key: "address", label: "Địa chỉ", icon: "location-outline" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Join the edit</Text>
        <Text style={styles.title}>Tạo tài khoản mới</Text>
        <Text style={styles.subtitle}>
          Lưu thông tin mua sắm, theo dõi đơn hàng và checkout nhanh hơn cho những lần sau.
        </Text>
      </View>

      <View style={styles.card}>
        {fields.map((item) => (
          <View key={item.key} style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{item.label}</Text>
            <View style={styles.inputShell}>
              <Ionicons name={item.icon} size={18} color="#9a3412" />
              <TextInput
                style={styles.input}
                placeholder={item.label}
                placeholderTextColor="#9ca3af"
                secureTextEntry={item.secureTextEntry}
                value={form[item.key]}
                onChangeText={(v) => setForm({ ...form, [item.key]: v })}
                autoCapitalize={item.key === "email" ? "none" : "sentences"}
                keyboardType={item.keyboardType}
              />
            </View>
          </View>
        ))}
        <Pressable
          style={[styles.primaryBtn, loading && styles.disabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Tạo tài khoản</Text>
              <Ionicons name="sparkles-outline" size={16} color="#fff" />
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f5f7",
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: "#f8e7d7",
    borderRadius: 28,
    padding: 22,
    gap: 10,
  },
  heroEyebrow: {
    color: "#9a3412",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 30,
    color: "#111827",
    fontFamily: FONTS.bold,
  },
  subtitle: { color: "#6b7280", lineHeight: 20, fontFamily: FONTS.regular },
  fieldWrap: { gap: 8 },
  fieldLabel: {
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: "#111827",
    fontFamily: FONTS.regular,
  },
  primaryBtn: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontFamily: FONTS.bold },
  disabled: { opacity: 0.65 },
});
