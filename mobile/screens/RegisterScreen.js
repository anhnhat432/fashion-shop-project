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
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = (field, value) => {
    const next = { ...errors };
    if (field === "name") {
      next.name = value.trim() ? "" : "Họ tên không được để trống";
    } else if (field === "email") {
      if (!value.trim()) next.email = "Email không được để trống";
      else if (!value.includes("@")) next.email = "Email không hợp lệ";
      else next.email = "";
    } else if (field === "password") {
      next.password = value.length >= 6 ? "" : "Mật khẩu tối thiểu 6 ký tự";
    } else if (field === "phone") {
      next.phone =
        !value || value.replace(/\D/g, "").length >= 9
          ? ""
          : "Số điện thoại cần tối thiểu 9 số";
    }
    setErrors(next);
  };

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    validate(key, value);
  };

  const handleRegister = async () => {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: form.phone.trim(),
      address: form.address.trim(),
    };

    const newErrors = {};
    if (!payload.name) newErrors.name = "Họ tên không được để trống";
    if (!payload.email) newErrors.email = "Email không được để trống";
    else if (!payload.email.includes("@")) newErrors.email = "Email không hợp lệ";
    if (!payload.password) newErrors.password = "Mật khẩu không được để trống";
    else if (payload.password.length < 6) newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
    if (payload.phone && payload.phone.replace(/\D/g, "").length < 9)
      newErrors.phone = "Số điện thoại cần tối thiểu 9 số";

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

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
        <Text style={styles.heroEyebrow}>Tham gia ngay</Text>
        <Text style={styles.title}>Tạo tài khoản mới</Text>
        <Text style={styles.subtitle}>
          Lưu thông tin mua sắm, theo dõi đơn hàng và thanh toán nhanh hơn cho những lần sau.
        </Text>
      </View>

      <View style={styles.card}>
        {fields.map((item) => (
          <View key={item.key} style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{item.label}</Text>
            <View style={[styles.inputShell, errors[item.key] ? styles.inputShellError : null]}>
              <Ionicons name={item.icon} size={18} color={errors[item.key] ? "#dc2626" : "#4f46e5"} />
              <TextInput
                style={styles.input}
                placeholder={item.label}
                placeholderTextColor="#9ca3af"
                secureTextEntry={item.key === "password" ? !showPassword : false}
                value={form[item.key]}
                onChangeText={(v) => handleChange(item.key, v)}
                autoCapitalize={item.key === "email" ? "none" : "sentences"}
                keyboardType={item.keyboardType}
              />
              {item.key === "password" ? (
                <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#94a3b8"
                  />
                </Pressable>
              ) : null}
            </View>
            {errors[item.key] ? (
              <Text style={styles.fieldError}>{errors[item.key]}</Text>
            ) : null}
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
    backgroundColor: "#f1f5f9",
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: "#eef2ff",
    borderRadius: 28,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  heroEyebrow: {
    color: "#4f46e5",
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
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 30,
    color: "#1e293b",
    fontFamily: FONTS.bold,
  },
  subtitle: { color: "#64748b", lineHeight: 20, fontFamily: FONTS.regular },
  fieldWrap: { gap: 8 },
  fieldLabel: {
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: "#1e293b",
    fontFamily: FONTS.regular,
  },
  primaryBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontFamily: FONTS.bold },
  inputShellError: {
    borderColor: "#dc2626",
    backgroundColor: "#fff5f5",
  },
  fieldError: {
    color: "#dc2626",
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: -4,
  },
  disabled: { opacity: 0.65 },
});
