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

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password)
      return Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
    if (!normalizedEmail.includes("@"))
      return Alert.alert("Lỗi", "Email không hợp lệ");

    setLoading(true);
    try {
      await login(normalizedEmail, password);
    } catch (error) {
      Alert.alert("Lỗi", error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Fashion Shop</Text>
        <Text style={styles.subtitle}>Đăng nhập để tiếp tục mua sắm</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          style={[styles.primaryBtn, loading && styles.disabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Đăng nhập</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>Chưa có tài khoản? Đăng ký ngay</Text>
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
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: FONTS.bold,
  },
  subtitle: {
    color: "#666",
    textAlign: "center",
    marginBottom: 6,
    fontFamily: FONTS.regular,
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
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontFamily: FONTS.bold },
  disabled: { opacity: 0.65 },
  link: {
    textAlign: "center",
    color: "#2563eb",
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
});
