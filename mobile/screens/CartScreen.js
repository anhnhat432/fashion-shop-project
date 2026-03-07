import React from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const { cartItems, updateQty, removeItem } = useCart();
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={cartItems}
        keyExtractor={(_, idx) => String(idx)}
        ListEmptyComponent={<Text>Giỏ hàng trống</Text>}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text style={{ fontWeight: '700' }}>{item.name}</Text>
            <Text>{item.size} / {item.color}</Text>
            <Text>{item.price.toLocaleString()} đ x {item.quantity}</Text>
            <View style={styles.row}><Button title="-" onPress={() => updateQty(index, -1)} /><Button title="+" onPress={() => updateQty(index, 1)} /><Button title="Xóa" onPress={() => removeItem(index)} /></View>
          </View>
        )}
      />
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Tổng: {total.toLocaleString()} đ</Text>
      <Button title="Tiến hành thanh toán" onPress={() => navigation.navigate('Checkout')} disabled={!cartItems.length} />
    </View>
  );
}

const styles = StyleSheet.create({ item: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, marginBottom: 8 }, row: { flexDirection: 'row', gap: 8, marginTop: 8 } });
