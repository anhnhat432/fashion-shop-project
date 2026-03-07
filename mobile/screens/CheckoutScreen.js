import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const onlyDigits = (value) => value.replace(/\D/g, '');

export default function CheckoutScreen({ navigation }) {
  const { cartItems, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!shippingAddress.trim() || shippingAddress.trim().length < 5) {
      return Alert.alert('Loi', 'Dia chi nhan hang can toi thieu 5 ky tu');
    }

    const normalizedPhone = onlyDigits(phone.trim());
    if (normalizedPhone.length < 9 || normalizedPhone.length > 11) {
      return Alert.alert('Loi', 'So dien thoai khong hop le');
    }

    if (!cartItems.length) return Alert.alert('Loi', 'Gio hang dang trong');

    setLoading(true);
    try {
      await api.post('/orders', {
        items: cartItems,
        shippingAddress: shippingAddress.trim(),
        phone: normalizedPhone,
        paymentMethod
      });
      clearCart();
      Alert.alert('Thanh cong', 'Dat hang thanh cong');
      navigation.navigate('OrderHistory');
    } catch (error) {
      Alert.alert('Loi', error.response?.data?.message || 'Khong the tao don hang');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Dia chi nhan hang" value={shippingAddress} onChangeText={setShippingAddress} />
      <TextInput style={styles.input} placeholder="So dien thoai" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Text style={styles.label}>Phuong thuc thanh toan</Text>
      <View style={styles.row}>
        <Button title={paymentMethod === 'COD' ? 'OK COD' : 'COD'} onPress={() => setPaymentMethod('COD')} />
        <Button title={paymentMethod === 'BANK_TRANSFER' ? 'OK Chuyen khoan' : 'Chuyen khoan'} onPress={() => setPaymentMethod('BANK_TRANSFER')} />
      </View>
      <Button title={loading ? 'Dang dat hang...' : 'Xac nhan dat hang'} onPress={handleCheckout} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10, backgroundColor: '#f3f5f7' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, backgroundColor: '#fff' },
  row: { flexDirection: 'row', gap: 8 },
  label: { fontWeight: '700', marginTop: 4 }
});
