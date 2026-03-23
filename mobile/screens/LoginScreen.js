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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>Editorial drop</Text>
        </View>
        <Text style={styles.title}>Fashion Shop Studio</Text>
        <Text style={styles.subtitle}>
          Đăng nhập để tiếp tục mua sắm, theo dõi đơn hàng và quản lý wishlist theo phong cách riêng.
        </Text>
        <View style={styles.heroStats}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>New</Text>
            <Text style={styles.statLabel}>collection</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Fast</Text>
            <Text style={styles.statLabel}>checkout</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Email</Text>
          <View style={styles.inputShell}>
            <Ionicons name="mail-outline" size={18} color="#9a3412" />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Mật khẩu</Text>
          <View style={styles.inputShell}>
            <Ionicons name="lock-closed-outline" size={18} color="#9a3412" />
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f5f7",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    gap: 14,
  },
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 22,
    gap: 14,
  },
  heroBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroBadgeText: {
    color: "#fde68a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  card: {
    backgroundColor: "#fffaf5",
    borderRadius: 24,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "#ead9ca",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 32,
    color: "#fff",
    fontFamily: FONTS.bold,
  },
  subtitle: {
    color: "#d1d5db",
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  heroStats: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  statValue: { color: "#fff", fontSize: 18, fontFamily: FONTS.bold },
  statLabel: {
    color: "#cbd5e1",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
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
    borderColor: "#ead9ca",
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
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
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontFamily: FONTS.bold },
  disabled: { opacity: 0.65 },
  linkWrap: { paddingTop: 4 },
  link: {
    textAlign: "center",
    color: "#9a3412",
    fontFamily: FONTS.medium,
  },
});
