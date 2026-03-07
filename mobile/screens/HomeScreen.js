import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import CategoryList from '../components/CategoryList';
import ProductCard from '../components/ProductCard';

const allCategory = { _id: '', name: 'Tat ca' };

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([allCategory]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories([allCategory, ...(res.data.data || [])]);
    } catch (err) {
      setCategories([allCategory]);
    }
  };

  const fetchProducts = async (nextSearch = search, nextCategoryId = selectedCategoryId) => {
    setLoading(true);
    setError('');
    try {
      const params = { search: nextSearch.trim() };
      if (nextCategoryId) params.categoryId = nextCategoryId;
      const res = await api.get('/products', { params });
      setProducts(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Khong tai duoc san pham');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts('', '');
  }, []);

  const onSearch = () => {
    fetchProducts(search, selectedCategoryId);
  };

  const onSelectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    fetchProducts(search, categoryId);
  };

  const emptyText = useMemo(() => {
    if (search.trim() || selectedCategoryId) return 'Khong tim thay san pham phu hop';
    return 'Chua co san pham';
  }, [search, selectedCategoryId]);

  return (
    <View style={styles.container}>
      <SearchBar value={search} onChangeText={setSearch} onSearch={onSearch} />

      <CategoryList categories={categories} selectedId={selectedCategoryId} onSelect={onSelectCategory} />

      <View style={styles.actionRow}>
        <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={18} color="#111827" />
          <Text style={styles.actionText}>Gio hang</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={18} color="#111827" />
          <Text style={styles.actionText}>Tai khoan</Text>
        </Pressable>
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
          <Pressable style={styles.retryBtn} onPress={onSearch}><Text style={styles.retryText}>Thu lai</Text></Pressable>
        </View>
      ) : null}

      {!loading && !error ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
            />
          )}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 10, backgroundColor: '#f3f5f7' },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6
  },
  actionText: { color: '#111827', fontWeight: '700' },
  centerBox: { alignItems: 'center', marginTop: 30, gap: 8 },
  muted: { color: '#6b7280' },
  listContent: { paddingTop: 2, paddingBottom: 20 },
  errorBox: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 10, gap: 8 },
  errorText: { color: '#b91c1c' },
  retryBtn: { alignSelf: 'flex-start', backgroundColor: '#111827', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  retryText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 28 }
});
