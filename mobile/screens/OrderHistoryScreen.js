import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
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
      setError(err.response?.data?.message || 'Khong tai duoc don hang');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Dang tai don hang...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={fetchOrders}><Text style={styles.retryText}>Thu lai</Text></Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={orders}
      keyExtractor={(item) => item._id}
      ListEmptyComponent={<Text style={styles.empty}>Chua co don hang nao</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.code}>Ma don: {item._id}</Text>
          <Text style={styles.status}>Trang thai: {item.status}</Text>
          <Text style={styles.total}>Tong: {Number(item.totalAmount || 0).toLocaleString()} d</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, padding: 12, backgroundColor: '#f3f5f7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, backgroundColor: '#f3f5f7' },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 },
  code: { fontWeight: '700', color: '#111827' },
  status: { marginTop: 2, color: '#374151' },
  total: { marginTop: 4, fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 26, color: '#6b7280' },
  muted: { color: '#6b7280' },
  error: { color: '#b91c1c', textAlign: 'center' },
  retryBtn: { backgroundColor: '#111827', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '700' }
});
