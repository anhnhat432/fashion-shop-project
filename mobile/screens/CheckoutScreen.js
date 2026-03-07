import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function CheckoutScreen({ navigation }) {
  const { cartItems, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!shippingAddress.trim() || !phone.trim() || !cartItems.length) {
      return Alert.alert('Lỗi', 'Thiếu thông tin đặt hàng');
    }

    setLoading(true);
    try {
      await api.post('/orders', {
        items: cartItems,
        shippingAddress: shippingAddress.trim(),
        phone: phone.trim(),
        paymentMethod
      });
      clearCart();
      Alert.alert('Thành công', 'Đặt hàng thành công');
      navigation.navigate('OrderHistory');
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Địa chỉ nhận hàng" value={shippingAddress} onChangeText={setShippingAddress} />
      <TextInput style={styles.input} placeholder="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Text style={{ fontWeight: '700' }}>Phương thức thanh toán</Text>
      <View style={styles.row}>
        <Button title={paymentMethod === 'COD' ? '✓ COD' : 'COD'} onPress={() => setPaymentMethod('COD')} />
        <Button title={paymentMethod === 'BANK_TRANSFER' ? '✓ Chuyển khoản' : 'Chuyển khoản'} onPress={() => setPaymentMethod('BANK_TRANSFER')} />
      </View>
      <Button title={loading ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng'} onPress={handleCheckout} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  row: { flexDirection: 'row', gap: 8 }
});
