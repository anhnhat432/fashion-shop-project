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

const BANK_TRANSFER_WINDOW_MS = 10 * 60 * 1000;
const PAYMENT_ACCOUNT = {
  bank: "MB Bank",
  number: "1234567899",
  name: "FASHION SHOP DEMO",
};

const onlyDigits = (value) => value.replace(/\D/g, "");

const paymentMethodLabelMap = {
  COD: "COD",
  BANK_TRANSFER: "Chuyển khoản",
};

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const formatCountdown = (remainingMs) => {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const formatDeadline = (value) =>
  new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });

const buildQrPattern = (seed) => {
  const size = 11;
  let hash = Array.from(seed).reduce(
    (total, char, index) => (total * 31 + char.charCodeAt(0) + index) % 104729,
    7,
  );

  return Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const col = index % size;
    const inFinder =
      (row < 3 && col < 3) ||
      (row < 3 && col >= size - 3) ||
      (row >= size - 3 && col < 3);

    if (inFinder) {
      const localRow = row % 3;
      const localCol = col % 3;
      return (
        localRow === 0 ||
        localRow === 2 ||
        localCol === 0 ||
        localCol === 2 ||
        (localRow === 1 && localCol === 1)
      );
    }

    hash = (hash * 73 + row * 17 + col * 29) % 9973;
    return hash % 2 === 0;
  });
};

function SimulatedQrMatrix({ seed }) {
  const cells = useMemo(() => buildQrPattern(seed), [seed]);

  return (
    <View style={styles.qrShell}>
      <View style={styles.qrMatrix}>
        {cells.map((filled, index) => (
          <View
            key={`${seed}-${index}`}
            style={[styles.qrCell, filled && styles.qrCellFilled]}
          />
        ))}
      </View>
      <Text style={styles.qrCaption}>QR mô phỏng</Text>
    </View>
  );
}

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
  const [transferDeadline, setTransferDeadline] = useState(
    () => Date.now() + BANK_TRANSFER_WINDOW_MS,
  );
  const [currentTime, setCurrentTime] = useState(() => Date.now());
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
  const transferReference = useMemo(() => {
    const totalPart = Math.max(0, Math.round(finalTotal))
      .toString()
      .slice(-6)
      .padStart(6, "0");
    const itemPart = String(cartItems.length).padStart(2, "0");
    const timePart = String(transferDeadline).slice(-4);
    return `FSHOP-${totalPart}-${itemPart}${timePart}`;
  }, [cartItems.length, finalTotal, transferDeadline]);
  const remainingTransferMs = Math.max(0, transferDeadline - currentTime);
  const isTransferExpired =
    paymentMethod === "BANK_TRANSFER" && remainingTransferMs <= 0;

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

  useEffect(() => {
    if (paymentMethod !== "BANK_TRANSFER") {
      return;
    }

    setTransferDeadline(Date.now() + BANK_TRANSFER_WINDOW_MS);
    setBankTransferConfirmed(false);
  }, [cartItems.length, finalTotal, paymentMethod]);

  useEffect(() => {
    if (paymentMethod !== "BANK_TRANSFER") {
      return undefined;
    }

    setCurrentTime(Date.now());
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentMethod]);

  const refreshTransferWindow = () => {
    setTransferDeadline(Date.now() + BANK_TRANSFER_WINDOW_MS);
    setCurrentTime(Date.now());
    setBankTransferConfirmed(false);
  };

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
      return Alert.alert(
        "Lỗi",
        "Địa chỉ nhận hàng cần tối thiểu 5 ký tự",
      );
    }

    const normalizedPhone = onlyDigits(phone.trim());
    if (normalizedPhone.length < 9 || normalizedPhone.length > 11) {
      return Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
    }

    if (!cartItems.length) {
      return Alert.alert("Lỗi", "Giỏ hàng đang trống");
    }

    if (paymentMethod === "BANK_TRANSFER" && isTransferExpired) {
      return Alert.alert(
        "Mã thanh toán đã hết hạn",
        "Vui lòng làm mới mã chuyển khoản mô phỏng trước khi gửi yêu cầu xác nhận.",
      );
    }

    if (paymentMethod === "BANK_TRANSFER" && !bankTransferConfirmed) {
      return Alert.alert(
        "Lỗi",
        "Vui lòng xác nhận bạn đã hoàn tất chuyển khoản mô phỏng.",
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
            ? "Khách đã gửi yêu cầu xác nhận chuyển khoản mô phỏng trong app"
            : "Khách sẽ thanh toán khi nhận hàng",
      });
      clearCart();
      Alert.alert(
        "Thành công",
        paymentMethod === "BANK_TRANSFER"
          ? "Đơn hàng đã được tạo và đang chờ shop xác nhận chuyển khoản."
          : "Đặt hàng thành công.",
      );
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
              <Text style={styles.heroStatValue}>{formatCurrency(finalTotal)}</Text>
              <Text style={styles.heroStatLabel}>Tổng thanh toán</Text>
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
                Thanh toán khi nhận hàng.
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
                Tạo đơn chờ xác nhận và để admin duyệt thanh toán sau khi đối
                chiếu mã giao dịch.
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
              <View style={styles.transferHeader}>
                <View style={styles.transferHeaderCopy}>
                  <Text style={styles.transferTitle}>
                    Chuyển khoản mô phỏng
                  </Text>
                  <Text style={styles.transferSubtitle}>
                    Sau khi đặt hàng, đơn sẽ ở trạng thái chờ xác nhận thanh
                    toán cho đến khi admin duyệt.
                  </Text>
                </View>
                <Pressable
                  style={styles.refreshTransferBtn}
                  onPress={refreshTransferWindow}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={14}
                    color="#4338ca"
                  />
                  <Text style={styles.refreshTransferText}>Làm mới mã</Text>
                </Pressable>
              </View>

              <View style={styles.transferHero}>
                <SimulatedQrMatrix seed={`${transferReference}-${finalTotal}`} />

                <View style={styles.transferHeroInfo}>
                  <View
                    style={[
                      styles.deadlinePill,
                      isTransferExpired && styles.deadlinePillExpired,
                    ]}
                  >
                    <Ionicons
                      name={isTransferExpired ? "alert-circle" : "time-outline"}
                      size={14}
                      color={isTransferExpired ? "#b91c1c" : "#4338ca"}
                    />
                    <Text
                      style={[
                        styles.deadlinePillText,
                        isTransferExpired && styles.deadlinePillTextExpired,
                      ]}
                    >
                      {isTransferExpired
                        ? "Mã đã hết hạn"
                        : `Còn ${formatCountdown(remainingTransferMs)}`}
                    </Text>
                  </View>

                  <Text style={styles.transferAmount}>
                    {formatCurrency(finalTotal)}
                  </Text>
                  <Text style={styles.transferAccountName}>
                    {PAYMENT_ACCOUNT.name}
                  </Text>
                  <Text style={styles.transferAccountMeta}>
                    {PAYMENT_ACCOUNT.bank} • {PAYMENT_ACCOUNT.number}
                  </Text>
                  <Text style={styles.transferSupportCopy}>
                    Hạn xác nhận dự kiến: {formatDeadline(transferDeadline)}
                  </Text>
                </View>
              </View>

              <View style={styles.transferInfoGrid}>
                <View style={styles.transferInfoCard}>
                  <Text style={styles.transferInfoLabel}>Mã giao dịch</Text>
                  <Text style={styles.transferInfoValueMono}>
                    {transferReference}
                  </Text>
                </View>
                <View style={styles.transferInfoCard}>
                  <Text style={styles.transferInfoLabel}>Nội dung CK</Text>
                  <Text style={styles.transferInfoValue}>
                    {transferReference}
                  </Text>
                </View>
                <View style={styles.transferInfoCard}>
                  <Text style={styles.transferInfoLabel}>Ngân hàng</Text>
                  <Text style={styles.transferInfoValue}>
                    {PAYMENT_ACCOUNT.bank}
                  </Text>
                </View>
                <View style={styles.transferInfoCard}>
                  <Text style={styles.transferInfoLabel}>Trạng thái đơn</Text>
                  <Text style={styles.transferInfoValue}>
                    Chờ xác nhận thanh toán
                  </Text>
                </View>
              </View>

              <View style={styles.transferNotice}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color="#4338ca"
                />
                <Text style={styles.transferNoticeText}>
                  Hệ thống chỉ ghi nhận bạn đã gửi yêu cầu xác nhận. Đơn sẽ chưa
                  được đánh dấu đã thanh toán ngay lập tức.
                </Text>
              </View>

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
                  Tôi đã hoàn tất chuyển khoản mô phỏng và muốn gửi yêu cầu xác
                  nhận cho shop.
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
                Giảm {formatCurrency(appliedVoucher.discountAmount)} cho đơn hiện
                tại.
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
            {paymentMethod === "BANK_TRANSFER" ? (
              <View style={styles.orderPreviewChip}>
                <Text style={styles.orderPreviewText}>Chờ xác nhận</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(shippingFee)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá voucher</Text>
            <Text style={styles.summaryDiscount}>
              - {formatCurrency(discountAmount)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={styles.summaryTotalLabel}>Tổng thanh toán</Text>
            <Text style={styles.summaryTotalValue}>
              {formatCurrency(finalTotal)}
            </Text>
          </View>
        </View>

        <Pressable
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleCheckout}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading
              ? "Đang đặt hàng..."
              : paymentMethod === "BANK_TRANSFER"
                ? "Tạo đơn và gửi xác nhận"
                : "Xác nhận đặt hàng"}
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
    borderRadius: 18,
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
  paymentMethodMeta: {
    color: "#6b7280",
    fontFamily: FONTS.regular,
    lineHeight: 19,
  },
  transferCard: {
    backgroundColor: "#eef2ff",
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  transferHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  transferHeaderCopy: { flex: 1, gap: 4 },
  transferTitle: { color: "#312e81", fontFamily: FONTS.bold, fontSize: 16 },
  transferSubtitle: {
    color: "#4338ca",
    fontFamily: FONTS.regular,
    lineHeight: 19,
  },
  refreshTransferBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  refreshTransferText: {
    color: "#4338ca",
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  transferHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  qrShell: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe4ff",
    alignItems: "center",
    gap: 8,
  },
  qrMatrix: {
    width: 115,
    height: 115,
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#fff",
  },
  qrCell: {
    width: 9,
    height: 9,
    marginRight: 1,
    marginBottom: 1,
    backgroundColor: "#e2e8f0",
    borderRadius: 1,
  },
  qrCellFilled: { backgroundColor: "#1e293b" },
  qrCaption: { color: "#64748b", fontFamily: FONTS.medium, fontSize: 12 },
  transferHeroInfo: { flex: 1, minWidth: 180, gap: 6 },
  deadlinePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e0e7ff",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deadlinePillExpired: { backgroundColor: "#fee2e2" },
  deadlinePillText: {
    color: "#4338ca",
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  deadlinePillTextExpired: { color: "#b91c1c" },
  transferAmount: {
    color: "#111827",
    fontFamily: FONTS.bold,
    fontSize: 24,
    lineHeight: 30,
  },
  transferAccountName: {
    color: "#1e293b",
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  transferAccountMeta: {
    color: "#475569",
    fontFamily: FONTS.regular,
  },
  transferSupportCopy: {
    color: "#4338ca",
    fontFamily: FONTS.medium,
    lineHeight: 18,
  },
  transferInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  transferInfoCard: {
    flexGrow: 1,
    minWidth: 135,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#dbe4ff",
    gap: 4,
  },
  transferInfoLabel: {
    color: "#64748b",
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  transferInfoValue: {
    color: "#1e293b",
    fontFamily: FONTS.bold,
    lineHeight: 19,
  },
  transferInfoValueMono: {
    color: "#1e293b",
    fontFamily: FONTS.bold,
    letterSpacing: 0.3,
  },
  transferNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 14,
    padding: 12,
  },
  transferNoticeText: {
    flex: 1,
    color: "#3730a3",
    fontFamily: FONTS.regular,
    lineHeight: 19,
  },
  confirmBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 12,
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
  confirmText: {
    flex: 1,
    color: "#1e293b",
    fontFamily: FONTS.medium,
    lineHeight: 19,
  },
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
  voucherText: {
    color: "#166534",
    fontFamily: FONTS.regular,
    lineHeight: 19,
  },
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
