import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import { FONTS } from "../constants/fonts";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "../constants/shop";

const onlyDigits = (value) => value.replace(/\D/g, "");

const paymentMethodLabelMap = {
  COD: "COD",
  BANK_TRANSFER: "Chuyển khoản",
};

export default function CheckoutScreen({ navigation }) {
  const { cartItems, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [bankTransferConfirmed, setBankTransferConfirmed] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [loading, setLoading] = useState(false);
  const introAnim = useRef(new Animated.Value(0)).current;
  const transferAnim = useRef(new Animated.Value(0)).current;

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [cartItems],
  );
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const discountAmount = Number(appliedVoucher?.discountAmount || 0);
  const finalTotal = subtotal - discountAmount + shippingFee;
  const itemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems],
  );
  const transferReference = useMemo(
    () => `FSHOP-${String(finalTotal).slice(0, 6)}-${cartItems.length}`,
    [finalTotal, cartItems.length],
  );

  useEffect(() => {
    Animated.timing(introAnim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [introAnim]);

  useEffect(() => {
    Animated.timing(transferAnim, {
      toValue: paymentMethod === "BANK_TRANSFER" ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [paymentMethod, transferAnim]);

  useEffect(() => {
    setAppliedVoucher(null);
  }, [subtotal]);

  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      return Alert.alert("Lỗi", "Vui lòng nhập mã giảm giá");
    }

    setApplyingVoucher(true);
    try {
      const res = await api.get(`/vouchers/validate/${voucherCode.trim()}`, {
        params: { subtotal },
      });
      setAppliedVoucher(res.data.data);
      Alert.alert("Thành công", `Áp dụng mã ${res.data.data.code} thành công`);
    } catch (error) {
      setAppliedVoucher(null);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Mã giảm giá không hợp lệ",
      );
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleCheckout = async () => {
    if (!shippingAddress.trim() || shippingAddress.trim().length < 5) {
      return Alert.alert("Lỗi", "Địa chỉ nhận hàng cần tối thiểu 5 ký tự");
    }

    const normalizedPhone = onlyDigits(phone.trim());
    if (normalizedPhone.length < 9 || normalizedPhone.length > 11) {
      return Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
    }

    if (!cartItems.length) return Alert.alert("Lỗi", "Giỏ hàng đang trống");

    if (paymentMethod === "BANK_TRANSFER" && !bankTransferConfirmed) {
      return Alert.alert(
        "Lỗi",
        "Vui lòng xác nhận đã hoàn tất chuyển khoản mô phỏng",
      );
    }

    setLoading(true);
    try {
      await api.post("/orders", {
        items: cartItems,
        shippingAddress: shippingAddress.trim(),
        phone: normalizedPhone,
        paymentMethod,
        bankTransferConfirmed,
        voucherCode: appliedVoucher?.code || "",
        transferReference,
        paymentNote:
          paymentMethod === "BANK_TRANSFER"
            ? "Khách đã xác nhận chuyển khoản mô phỏng trong app"
            : "Khách sẽ thanh toán khi nhận hàng",
      });
      clearCart();
      Alert.alert("Thành công", "Đặt hàng thành công");
      navigation.replace("OrderHistory");
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
      <Animated.View
        style={{
          opacity: introAnim,
          transform: [
            {
              translateY: introAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        }}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroEyebrow}>Bước cuối</Text>
              <Text style={styles.heroTitle}>Xác nhận đơn hàng của bạn.</Text>
            </View>
            <Ionicons name="card-outline" size={24} color="#a5b4fc" />
          </View>
          <Text style={styles.heroSubtitle}>
            Kiểm tra thông tin giao hàng, chọn cách thanh toán và hoàn tất đơn
            trong một màn hình.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatValue}>{itemCount}</Text>
              <Text style={styles.heroStatLabel}>Món hàng</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatValue}>
                {finalTotal.toLocaleString()} đ
              </Text>
              <Text style={styles.heroStatLabel}>Cần thanh toán</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>
          <View style={styles.inputShell}>
            <Ionicons name="location-outline" size={18} color="#4f46e5" />
            <TextInput
              style={styles.input}
              placeholder="Địa chỉ nhận hàng"
              placeholderTextColor="#9ca3af"
              value={shippingAddress}
              onChangeText={setShippingAddress}
            />
          </View>
          <View style={styles.inputShell}>
            <Ionicons name="call-outline" size={18} color="#4f46e5" />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              placeholderTextColor="#9ca3af"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.paymentMethodColumn}>
            <Pressable
              style={[
                styles.paymentMethodCard,
                paymentMethod === "COD" && styles.paymentMethodCardActive,
              ]}
              onPress={() => {
                setPaymentMethod("COD");
                setBankTransferConfirmed(false);
              }}
            >
              <View style={styles.paymentMethodHead}>
                <Ionicons name="cash-outline" size={18} color="#4f46e5" />
                <Text style={styles.paymentMethodTitle}>COD</Text>
              </View>
              <Text style={styles.paymentMethodMeta}>
                Thanh toán khi nhận hàng
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.paymentMethodCard,
                paymentMethod === "BANK_TRANSFER" &&
                  styles.paymentMethodCardActive,
              ]}
              onPress={() => setPaymentMethod("BANK_TRANSFER")}
            >
              <View style={styles.paymentMethodHead}>
                <Ionicons name="business-outline" size={18} color="#4f46e5" />
                <Text style={styles.paymentMethodTitle}>Chuyển khoản</Text>
              </View>
              <Text style={styles.paymentMethodMeta}>
                Mô phỏng chuyển khoản trước khi xác nhận đơn
              </Text>
            </Pressable>
          </View>

          {paymentMethod === "BANK_TRANSFER" ? (
            <Animated.View
              style={[
                styles.transferCard,
                {
                  opacity: transferAnim,
                  transform: [
                    {
                      translateY: transferAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [12, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.transferTitle}>
                Thông tin chuyển khoản mô phỏng
              </Text>
              <Text style={styles.transferLine}>Ngân hàng: MB Bank</Text>
              <Text style={styles.transferLine}>Số tài khoản: 1234567899</Text>
              <Text style={styles.transferLine}>
                Chủ tài khoản: FASHION SHOP DEMO
              </Text>
              <Text style={styles.transferLine}>
                Nội dung: {transferReference}
              </Text>
              <Text style={styles.transferLine}>
                Số tiền mô phỏng: {finalTotal.toLocaleString()} đ
              </Text>

              <Pressable
                style={[
                  styles.confirmBox,
                  bankTransferConfirmed && styles.confirmBoxActive,
                ]}
                onPress={() => setBankTransferConfirmed((prev) => !prev)}
              >
                <View
                  style={[
                    styles.checkbox,
                    bankTransferConfirmed && styles.checkboxActive,
                  ]}
                >
                  {bankTransferConfirmed ? (
                    <Text style={styles.checkboxTick}>✓</Text>
                  ) : null}
                </View>
                <Text style={styles.confirmText}>
                  Tôi đã hoàn tất chuyển khoản mô phỏng
                </Text>
              </Pressable>
            </Animated.View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mã giảm giá</Text>
          <View style={styles.voucherRow}>
            <View style={[styles.inputShell, styles.voucherInputShell]}>
              <Ionicons name="pricetag-outline" size={18} color="#4f46e5" />
              <TextInput
                style={styles.input}
                placeholder="Nhập mã giảm giá"
                placeholderTextColor="#9ca3af"
                value={voucherCode}
                onChangeText={setVoucherCode}
                autoCapitalize="characters"
              />
            </View>
            <Pressable
              style={[
                styles.applyBtn,
                applyingVoucher && styles.submitBtnDisabled,
              ]}
              onPress={applyVoucher}
              disabled={applyingVoucher}
            >
              <Text style={styles.applyBtnText}>
                {applyingVoucher ? "..." : "Áp dụng"}
              </Text>
            </Pressable>
          </View>
          {appliedVoucher ? (
            <View style={styles.voucherCard}>
              <Text style={styles.voucherTitle}>Mã {appliedVoucher.code}</Text>
              <Text style={styles.voucherText}>
                Giảm{" "}
                {Number(appliedVoucher.discountAmount || 0).toLocaleString()} đ
                cho đơn hiện tại
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tóm tắt thanh toán</Text>
          <View style={styles.orderPreviewRow}>
            <View style={styles.orderPreviewChip}>
              <Text style={styles.orderPreviewText}>{itemCount} sản phẩm</Text>
            </View>
            <View style={styles.orderPreviewChip}>
              <Text style={styles.orderPreviewText}>
                {paymentMethodLabelMap[paymentMethod] || paymentMethod}
              </Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>
              {subtotal.toLocaleString()} đ
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>
              {shippingFee.toLocaleString()} đ
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá voucher</Text>
            <Text style={styles.summaryDiscount}>
              - {discountAmount.toLocaleString()} đ
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={styles.summaryTotalLabel}>Tổng thanh toán</Text>
            <Text style={styles.summaryTotalValue}>
              {finalTotal.toLocaleString()} đ
            </Text>
          </View>
        </View>

        <Pressable
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleCheckout}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? "Đang đặt hàng..." : "Xác nhận đặt hàng"}
          </Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  heroCard: {
    backgroundColor: "#1e1b4b",
    borderRadius: 24,
    padding: 18,
    gap: 12,
    marginBottom: 12,
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  heroEyebrow: {
    color: "#a5b4fc",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 32,
    fontFamily: FONTS.bold,
  },
  heroSubtitle: { color: "#c7d2fe", lineHeight: 20, fontFamily: FONTS.regular },
  heroStats: { flexDirection: "row", gap: 10 },
  heroStatCard: {
    flex: 1,
    backgroundColor: "rgba(99,102,241,0.18)",
    borderRadius: 16,
    padding: 12,
  },
  heroStatValue: { color: "#fff", fontFamily: FONTS.bold },
  heroStatLabel: { color: "#c7d2fe", fontSize: 12, fontFamily: FONTS.regular },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: { fontSize: 16, color: "#1e293b", fontFamily: FONTS.bold },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    color: "#1e293b",
    fontFamily: FONTS.regular,
  },
  paymentMethodColumn: { gap: 10 },
  paymentMethodCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  paymentMethodCardActive: {
    borderColor: "#4f46e5",
    backgroundColor: "#eef2ff",
  },
  paymentMethodHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  paymentMethodTitle: { color: "#1e293b", fontFamily: FONTS.bold },
  paymentMethodMeta: { color: "#6b7280", fontFamily: FONTS.regular },
  transferCard: {
    backgroundColor: "#eef2ff",
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  transferTitle: { color: "#4f46e5", fontFamily: FONTS.bold },
  transferLine: { color: "#4338ca", fontFamily: FONTS.regular },
  confirmBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  confirmBoxActive: { borderColor: "#4f46e5" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#9ca3af",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  checkboxTick: { color: "#fff", fontFamily: FONTS.bold },
  confirmText: { flex: 1, color: "#1e293b", fontFamily: FONTS.medium },
  voucherRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  voucherInputShell: { flex: 1 },
  applyBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  applyBtnText: { color: "#fff", fontFamily: FONTS.bold },
  voucherCard: {
    backgroundColor: "#ecfdf5",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  voucherTitle: { color: "#166534", fontFamily: FONTS.bold },
  voucherText: { color: "#166534", fontFamily: FONTS.regular },
  orderPreviewRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  orderPreviewChip: {
    borderRadius: 999,
    backgroundColor: "#eef2ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  orderPreviewText: { color: "#4f46e5", fontFamily: FONTS.medium },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
    marginTop: 4,
  },
  summaryLabel: { color: "#6b7280", fontFamily: FONTS.regular },
  summaryValue: { color: "#1e293b", fontFamily: FONTS.medium },
  summaryDiscount: { color: "#166534", fontFamily: FONTS.bold },
  summaryTotalLabel: { color: "#1e293b", fontFamily: FONTS.bold },
  summaryTotalValue: { color: "#1e293b", fontSize: 18, fontFamily: FONTS.bold },
  submitBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: "#fff", fontFamily: FONTS.bold, fontSize: 16 },
});
