import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    const res = await api.get('/products', { params: { search } });
    setProducts(res.data.data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 1 }]} value={search} onChangeText={setSearch} placeholder="Tìm sản phẩm" />
        <Button title="Tìm" onPress={fetchProducts} />
      </View>
      <View style={styles.row}><Button title="Giỏ hàng" onPress={() => navigation.navigate('Cart')} /><Button title="Tài khoản" onPress={() => navigation.navigate('Profile')} /></View>
      {loading ? <ActivityIndicator size="large" /> : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text>Không có sản phẩm</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}>
              <Image source={{ uri: item.image || 'https://picsum.photos/100' }} style={styles.image} />
              <View style={{ flex: 1 }}><Text style={styles.name}>{item.name}</Text><Text>{item.price.toLocaleString()} đ</Text></View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 10 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  card: { flexDirection: 'row', gap: 10, backgroundColor: '#f7f7f7', padding: 10, borderRadius: 8, marginBottom: 10 },
  image: { width: 70, height: 70, borderRadius: 8 },
  name: { fontWeight: '700' }
});
