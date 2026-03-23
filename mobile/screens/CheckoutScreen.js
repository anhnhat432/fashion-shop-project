import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import { FONTS } from "../constants/fonts";

const onlyDigits = (value) => value.replace(/\D/g, "");

export default function CheckoutScreen({ navigation }) {
  const { cartItems, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [bankTransferConfirmed, setBankTransferConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [cartItems],
  );
  const shippingFee = subtotal >= 499000 ? 0 : 30000;
  const finalTotal = subtotal + shippingFee;
  const transferReference = useMemo(() => `FSHOP-${String(finalTotal).slice(0, 6)}-${cartItems.length}`, [finalTotal, cartItems.length]);

  const handleCheckout = async () => {
    if (!shippingAddress.trim() || shippingAddress.trim().length < 5) {
      return Alert.alert("Lỗi", "Địa chỉ nhận hàng cần tối thiểu 5 ký tự");
    }

    const normalizedPhone = onlyDigits(phone.trim());
    if (normalizedPhone.length < 9 || normalizedPhone.length > 11) {
      return Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
    }

    if (!cartItems.length) return Alert.alert("Lỗi", "Giỏ hàng đang trống");

    if (paymentMethod === 'BANK_TRANSFER' && !bankTransferConfirmed) {
      return Alert.alert('Lỗi', 'Vui lòng xác nhận đã hoàn tất chuyển khoản mô phỏng');
    }

    setLoading(true);
    try {
      await api.post("/orders", {
        items: cartItems,
        shippingAddress: shippingAddress.trim(),
        phone: normalizedPhone,
        paymentMethod,
        bankTransferConfirmed,
        transferReference,
        paymentNote:
          paymentMethod === 'BANK_TRANSFER'
            ? 'Khách đã xác nhận chuyển khoản mô phỏng trong app'
            : 'Khách sẽ thanh toán khi nhận hàng',
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>
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
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        <View style={styles.paymentMethodColumn}>
          <Pressable
            style={[styles.paymentMethodCard, paymentMethod === 'COD' && styles.paymentMethodCardActive]}
            onPress={() => {
              setPaymentMethod('COD');
              setBankTransferConfirmed(false);
            }}
          >
            <Text style={styles.paymentMethodTitle}>COD</Text>
            <Text style={styles.paymentMethodMeta}>Thanh toán khi nhận hàng</Text>
          </Pressable>

          <Pressable
            style={[styles.paymentMethodCard, paymentMethod === 'BANK_TRANSFER' && styles.paymentMethodCardActive]}
            onPress={() => setPaymentMethod('BANK_TRANSFER')}
          >
            <Text style={styles.paymentMethodTitle}>BANK_TRANSFER</Text>
            <Text style={styles.paymentMethodMeta}>Mô phỏng chuyển khoản trước khi xác nhận đơn</Text>
          </Pressable>
        </View>

        {paymentMethod === 'BANK_TRANSFER' ? (
          <View style={styles.transferCard}>
            <Text style={styles.transferTitle}>Thông tin chuyển khoản mô phỏng</Text>
            <Text style={styles.transferLine}>Ngân hàng: MB Bank</Text>
            <Text style={styles.transferLine}>Số tài khoản: 1234567899</Text>
            <Text style={styles.transferLine}>Chủ tài khoản: FASHION SHOP DEMO</Text>
            <Text style={styles.transferLine}>Nội dung: {transferReference}</Text>
            <Text style={styles.transferLine}>Số tiền mô phỏng: {finalTotal.toLocaleString()} đ</Text>

            <Pressable
              style={[styles.confirmBox, bankTransferConfirmed && styles.confirmBoxActive]}
              onPress={() => setBankTransferConfirmed((prev) => !prev)}
            >
              <View style={[styles.checkbox, bankTransferConfirmed && styles.checkboxActive]}>
                {bankTransferConfirmed ? <Text style={styles.checkboxTick}>✓</Text> : null}
              </View>
              <Text style={styles.confirmText}>Tôi đã hoàn tất chuyển khoản mô phỏng</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tóm tắt thanh toán</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tạm tính</Text>
          <Text style={styles.summaryValue}>{subtotal.toLocaleString()} đ</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
          <Text style={styles.summaryValue}>{shippingFee.toLocaleString()} đ</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryRowTotal]}>
          <Text style={styles.summaryTotalLabel}>Tổng thanh toán</Text>
          <Text style={styles.summaryTotalValue}>{finalTotal.toLocaleString()} đ</Text>
        </View>
      </View>

      <Pressable
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={handleCheckout}
        disabled={loading}
      >
        <Text style={styles.submitBtnText}>
          {loading ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f5f7" },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  sectionTitle: { fontSize: 16, color: '#111827', fontFamily: FONTS.bold },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    fontFamily: FONTS.regular,
  },
  paymentMethodColumn: { gap: 10 },
  paymentMethodCard: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  paymentMethodCardActive: {
    borderColor: '#111827',
    backgroundColor: '#f9fafb',
  },
  paymentMethodTitle: { color: '#111827', fontFamily: FONTS.bold },
  paymentMethodMeta: { color: '#6b7280', fontFamily: FONTS.regular },
  transferCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  transferTitle: { color: '#9a3412', fontFamily: FONTS.bold },
  transferLine: { color: '#7c2d12', fontFamily: FONTS.regular },
  confirmBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 10,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  confirmBoxActive: {
    borderColor: '#111827',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  checkboxTick: { color: '#fff', fontFamily: FONTS.bold },
  confirmText: { flex: 1, color: '#111827', fontFamily: FONTS.medium },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    marginTop: 4,
  },
  summaryLabel: { color: '#6b7280', fontFamily: FONTS.regular },
  summaryValue: { color: '#111827', fontFamily: FONTS.medium },
  summaryTotalLabel: { color: '#111827', fontFamily: FONTS.bold },
  summaryTotalValue: { color: '#111827', fontSize: 18, fontFamily: FONTS.bold },
  submitBtn: {
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 16 },
});
