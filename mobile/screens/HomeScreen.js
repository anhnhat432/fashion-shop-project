import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/products', { params: { search: search.trim() } });
      setProducts(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 1 }]} value={search} onChangeText={setSearch} placeholder="Tìm sản phẩm" />
        <Button title="Tìm" onPress={fetchProducts} />
      </View>
      <View style={styles.row}>
        <Button title="Giỏ hàng" onPress={() => navigation.navigate('Cart')} />
        <Button title="Tài khoản" onPress={() => navigation.navigate('Profile')} />
      </View>

      {loading ? <ActivityIndicator size="large" /> : null}
      {!loading && error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Thử lại" onPress={fetchProducts} />
        </View>
      ) : null}

      {!loading && !error ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text>Không có sản phẩm</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}>
              <Image source={{ uri: item.image || 'https://picsum.photos/100' }} style={styles.image} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text>{Number(item.price || 0).toLocaleString()} đ</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 10 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  card: { flexDirection: 'row', gap: 10, backgroundColor: '#f7f7f7', padding: 10, borderRadius: 8, marginBottom: 10 },
  image: { width: 70, height: 70, borderRadius: 8 },
  name: { fontWeight: '700' },
  errorBox: { backgroundColor: '#ffe6e6', padding: 12, borderRadius: 8, gap: 8 },
  errorText: { color: '#b00020' }
});
