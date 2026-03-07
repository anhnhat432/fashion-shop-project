import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import api from '../services/api';

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders').then((res) => setOrders(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

  return (
    <FlatList
      style={{ padding: 12 }}
      data={orders}
      keyExtractor={(item) => item._id}
      ListEmptyComponent={<Text>Chưa có đơn hàng nào</Text>}
      renderItem={({ item }) => (
        <View style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: 8, marginBottom: 8 }}>
          <Text>Mã đơn: {item._id}</Text>
          <Text>Trạng thái: {item.status}</Text>
          <Text>Tổng: {item.totalAmount.toLocaleString()} đ</Text>
        </View>
      )}
    />
  );
}
