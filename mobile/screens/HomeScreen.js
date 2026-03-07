import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
      setError(err.response?.data?.message || 'Khong tai duoc san pham');
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
      <View style={styles.searchRow}>
        <TextInput style={styles.input} value={search} onChangeText={setSearch} placeholder="Tim san pham" />
        <Pressable style={styles.searchBtn} onPress={fetchProducts}><Text style={styles.searchBtnText}>Tim</Text></Pressable>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('Cart')}><Text style={styles.actionBtnText}>Gio hang</Text></Pressable>
        <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('Profile')}><Text style={styles.actionBtnText}>Tai khoan</Text></Pressable>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" />
          <Text style={styles.muted}>Dang tai san pham...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={fetchProducts}><Text style={styles.retryText}>Thu lai</Text></Pressable>
        </View>
      ) : null}

      {!loading && !error ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>Khong co san pham phu hop</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}>
              <Image source={{ uri: item.image || 'https://picsum.photos/100' }} style={styles.image} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{Number(item.price || 0).toLocaleString()} d</Text>
                <Text style={styles.desc} numberOfLines={2}>{item.description || 'San pham demo cho mon hoc'}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 8, backgroundColor: '#f3f5f7' },
  searchRow: { flexDirection: 'row', gap: 8 },
  actionRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  searchBtn: { backgroundColor: '#111827', borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '700' },
  actionBtn: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  actionBtnText: { fontWeight: '600', color: '#111827' },
  centerBox: { alignItems: 'center', marginTop: 30, gap: 8 },
  muted: { color: '#6b7280' },
  card: { flexDirection: 'row', gap: 10, backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 10 },
  image: { width: 76, height: 76, borderRadius: 8, backgroundColor: '#eee' },
  name: { fontWeight: '700', marginBottom: 2, color: '#111827' },
  price: { fontWeight: '700', marginBottom: 2 },
  desc: { color: '#6b7280', fontSize: 12 },
  errorBox: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 10, gap: 8 },
  errorText: { color: '#b91c1c' },
  retryBtn: { alignSelf: 'flex-start', backgroundColor: '#111827', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  retryText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 30 }
});
