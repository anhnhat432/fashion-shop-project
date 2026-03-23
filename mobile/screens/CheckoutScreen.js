import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import { FONTS } from "../constants/fonts";

const onlyDigits = (value) => value.replace(/\D/g, "");

export default function CheckoutScreen({ navigation }) {
  const { cartItems, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!shippingAddress.trim() || shippingAddress.trim().length < 5) {
      return Alert.alert("Lỗi", "Địa chỉ nhận hàng cần tối thiểu 5 ký tự");
    }

    const normalizedPhone = onlyDigits(phone.trim());
    if (normalizedPhone.length < 9 || normalizedPhone.length > 11) {
      return Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
    }

    if (!cartItems.length) return Alert.alert("Lỗi", "Giỏ hàng đang trống");

    setLoading(true);
    try {
      await api.post("/orders", {
        items: cartItems,
        shippingAddress: shippingAddress.trim(),
        phone: normalizedPhone,
        paymentMethod,
      });
      clearCart();
      Alert.alert("Thành công", "Đặt hàng thành công");
      navigation.navigate("OrderHistory");
    } catch (error) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể tạo đơn hàng",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ nhận hàng"
        value={shippingAddress}
        onChangeText={setShippingAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Phương thức thanh toán</Text>
      <View style={styles.row}>
        <Button
          title={paymentMethod === "COD" ? "OK COD" : "COD"}
          onPress={() => setPaymentMethod("COD")}
        />
        <Button
          title={
            paymentMethod === "BANK_TRANSFER"
              ? "OK Chuyển khoản"
              : "Chuyển khoản"
          }
          onPress={() => setPaymentMethod("BANK_TRANSFER")}
        />
      </View>
      <Button
        title={loading ? "Đang đặt hàng..." : "Xác nhận đặt hàng"}
        onPress={handleCheckout}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10, backgroundColor: "#f3f5f7" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    fontFamily: FONTS.regular,
  },
  row: { flexDirection: "row", gap: 8 },
  label: { fontWeight: "700", marginTop: 4, fontFamily: FONTS.bold },
});
