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
import api from "../services/api";
import { FONTS } from "../constants/fonts";

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!currentPassword) next.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (!newPassword || newPassword.length < 6) next.newPassword = "Mật khẩu mới tối thiểu 6 ký tự";
    if (newPassword === currentPassword) next.newPassword = "Mật khẩu mới phải khác mật khẩu cũ";
    if (newPassword !== confirmPassword) next.confirmPassword = "Mật khẩu xác nhận không khớp";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.put("/auth/me/change-password", { currentPassword, newPassword });
      Alert.alert("Thành công", "Mật khẩu đã được thay đổi", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      label: "Mật khẩu hiện tại",
      value: currentPassword,
      onChange: (v) => { setCurrentPassword(v); setErrors((p) => ({ ...p, currentPassword: "" })); },
      errorKey: "currentPassword",
      icon: "lock-closed-outline",
    },
    {
      label: "Mật khẩu mới",
      value: newPassword,
      onChange: (v) => { setNewPassword(v); setErrors((p) => ({ ...p, newPassword: "" })); },
      errorKey: "newPassword",
      icon: "lock-open-outline",
    },
    {
      label: "Xác nhận mật khẩu mới",
      value: confirmPassword,
      onChange: (v) => { setConfirmPassword(v); setErrors((p) => ({ ...p, confirmPassword: "" })); },
      errorKey: "confirmPassword",
      icon: "checkmark-circle-outline",
    },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Account security</Text>
          <Text style={styles.heroTitle}>Đổi mật khẩu</Text>
          <Text style={styles.heroSub}>Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật.</Text>
        </View>

        <View style={styles.card}>
          {fields.map((field) => (
            <View key={field.errorKey} style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <View style={[styles.inputShell, errors[field.errorKey] && styles.inputShellError]}>
                <Ionicons name={field.icon} size={18} color={errors[field.errorKey] ? "#dc2626" : "#4f46e5"} />
                <TextInput
                  style={styles.input}
                  value={field.value}
                  onChangeText={field.onChange}
                  secureTextEntry
                  placeholder="••••••"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                />
              </View>
              {errors[field.errorKey] ? (
                <Text style={styles.fieldError}>{errors[field.errorKey]}</Text>
              ) : null}
            </View>
          ))}

          <Pressable
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.btnText}>Cập nhật mật khẩu</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  content: { padding: 16, gap: 14, flexGrow: 1 },
  heroCard: {
    backgroundColor: "#1e1b4b",
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  heroEyebrow: {
    color: "#a5b4fc",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontFamily: FONTS.bold,
  },
  heroTitle: { color: "#fff", fontSize: 24, fontFamily: FONTS.bold },
  heroSub: { color: "#c7d2fe", fontFamily: FONTS.regular, lineHeight: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  fieldWrap: { gap: 6 },
  fieldLabel: { color: "#374151", fontFamily: FONTS.medium, fontSize: 14 },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  inputShellError: { borderColor: "#dc2626" },
  input: { flex: 1, color: "#1e293b", fontFamily: FONTS.regular, fontSize: 15 },
  fieldError: { color: "#dc2626", fontSize: 12, fontFamily: FONTS.regular },
  btn: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontFamily: FONTS.bold, fontSize: 16 },
});
