import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const newErrors = {};
    if (!normalizedEmail) newErrors.email = "Email không được để trống";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) newErrors.email = "Email không hợp lệ";
    if (!password) newErrors.password = "Mật khẩu không được để trống";

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>Điểm nhấn mới</Text>
        </View>
        <Text style={styles.title}>Fashion Shop</Text>
        <Text style={styles.subtitle}>
          Đăng nhập để tiếp tục mua sắm, theo dõi đơn hàng và quản lý sản phẩm yêu thích theo phong cách riêng.
        </Text>
        <View style={styles.heroStats}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Mới</Text>
            <Text style={styles.statLabel}>bộ sưu tập</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Nhanh</Text>
            <Text style={styles.statLabel}>thanh toán</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Email</Text>
          <View style={[styles.inputShell, errors.email ? styles.inputShellError : null]}>
            <Ionicons name="mail-outline" size={18} color={errors.email ? "#dc2626" : "#4f46e5"} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: "" })); }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Mật khẩu</Text>
          <View style={[styles.inputShell, errors.password ? styles.inputShellError : null]}>
            <Ionicons name="lock-closed-outline" size={18} color={errors.password ? "#dc2626" : "#4f46e5"} />
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: "" })); }}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#94a3b8"
              />
            </Pressable>
          </View>
          {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
        </View>

        <Pressable
          style={[styles.primaryBtn, loading && styles.disabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Đăng nhập</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </>
          )}
        </Pressable>

        <Pressable style={styles.linkWrap} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>Chưa có tài khoản? Tạo tài khoản mới</Text>
        </Pressable>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    gap: 14,
  },
  heroCard: {
    backgroundColor: "#1e1b4b",
    borderRadius: 28,
    padding: 22,
    gap: 14,
  },
  heroBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "rgba(165,180,252,0.2)",
  },
  heroBadgeText: {
    color: "#a5b4fc",
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
    fontSize: 32,
    color: "#fff",
    fontFamily: FONTS.bold,
  },
  subtitle: {
    color: "#c7d2fe",
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  heroStats: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(99,102,241,0.18)",
  },
  statValue: { color: "#fff", fontSize: 18, fontFamily: FONTS.bold },
  statLabel: {
    color: "#c7d2fe",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
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
    backgroundColor: "#fff",
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
  linkWrap: { paddingTop: 4 },
  link: {
    textAlign: "center",
    color: "#4f46e5",
    fontFamily: FONTS.medium,
  },
});
