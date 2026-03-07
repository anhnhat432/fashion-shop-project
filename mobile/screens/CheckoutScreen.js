import React, { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function CheckoutScreen({ navigation }) {
  const { cartItems, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const handleCheckout = async () => {
    if (!shippingAddress || !phone || !cartItems.length) return Alert.alert('Lỗi', 'Thiếu thông tin đặt hàng');
    try {
      await api.post('/orders', { items: cartItems, shippingAddress, phone, paymentMethod });
      clearCart();
      Alert.alert('Thành công', 'Đặt hàng thành công');
      navigation.navigate('OrderHistory');
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo đơn hàng');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Địa chỉ nhận hàng" value={shippingAddress} onChangeText={setShippingAddress} />
      <TextInput style={styles.input} placeholder="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="COD/BANK_TRANSFER" value={paymentMethod} onChangeText={setPaymentMethod} />
      <Button title="Xác nhận đặt hàng" onPress={handleCheckout} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, gap: 10 }, input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 } });
