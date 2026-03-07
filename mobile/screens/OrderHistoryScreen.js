import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Text, View } from 'react-native';
import api from '../services/api';

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
  if (error) return <View style={{ padding: 12, gap: 8 }}><Text>{error}</Text><Button title="Thử lại" onPress={fetchOrders} /></View>;

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
          <Text>Tổng: {Number(item.totalAmount || 0).toLocaleString()} đ</Text>
        </View>
      )}
    />
  );
}
