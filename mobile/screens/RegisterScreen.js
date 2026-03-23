import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Tạo tài khoản</Text>
        {[
          { key: "name", label: "Họ tên" },
          { key: "email", label: "Email" },
          { key: "password", label: "Mật khẩu" },
          { key: "phone", label: "Số điện thoại" },
          { key: "address", label: "Địa chỉ" },
        ].map((item) => (
          <TextInput
            key={item.key}
            style={styles.input}
            placeholder={item.label}
            secureTextEntry={item.key === "password"}
            value={form[item.key]}
            onChangeText={(v) => setForm({ ...form, [item.key]: v })}
            autoCapitalize="none"
          />
        ))}
        <Pressable
          style={[styles.primaryBtn, loading && styles.disabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Tạo tài khoản</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f3f5f7",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
    fontFamily: FONTS.bold,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fafafa",
    fontFamily: FONTS.regular,
  },
  primaryBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginTop: 4,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontFamily: FONTS.bold },
  disabled: { opacity: 0.65 },
});
