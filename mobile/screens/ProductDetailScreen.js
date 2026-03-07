import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const fallbackSizes = ['S', 'M', 'L'];
const fallbackColors = ['Den', 'Trang'];

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/products/${productId}`);
      const data = res.data.data;
      const sizeOptions = data.sizes?.length ? data.sizes : fallbackSizes;
      const colorOptions = data.colors?.length ? data.colors : fallbackColors;

      setProduct(data);
      setSize(sizeOptions[0]);
      setColor(colorOptions[0]);
      setQuantity(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Khong tai duoc chi tiet san pham');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [productId]);

  const changeQty = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAdd = () => {
    if (!product) return;

    addToCart({
      productId: product._id,
      name: product.name,
      image: product.image,
      price: Number(product.price),
      quantity,
      size,
      color
    });

    Alert.alert('Thanh cong', 'Da them vao gio hang');
    navigation.navigate('Cart');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Dang tai chi tiet...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={fetchDetail}><Text style={styles.retryText}>Thu lai</Text></Pressable>
      </View>
    );
  }

  const sizeOptions = product.sizes?.length ? product.sizes : fallbackSizes;
  const colorOptions = product.colors?.length ? product.colors : fallbackColors;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: product.image || 'https://picsum.photos/300' }} style={styles.image} />

      <View style={styles.card}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{Number(product.price || 0).toLocaleString()} d</Text>
        <Text style={styles.desc}>{product.description || 'San pham demo cho mon hoc'}</Text>

        <Text style={styles.label}>Chon size</Text>
        <View style={styles.optionRow}>
          {sizeOptions.map((item) => {
            const active = item === size;
            return (
              <Pressable key={item} style={[styles.optionBtn, active && styles.optionBtnActive]} onPress={() => setSize(item)}>
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Chon mau</Text>
        <View style={styles.optionRow}>
          {colorOptions.map((item) => {
            const active = item === color;
            return (
              <Pressable key={item} style={[styles.optionBtn, active && styles.optionBtnActive]} onPress={() => setColor(item)}>
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>So luong</Text>
        <View style={styles.qtyRow}>
          <Pressable style={styles.qtyBtn} onPress={() => changeQty(-1)}>
            <Text style={styles.qtyBtnText}>-</Text>
          </Pressable>
          <View style={styles.qtyValueBox}><Text style={styles.qtyValue}>{quantity}</Text></View>
          <Pressable style={styles.qtyBtn} onPress={() => changeQty(1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </Pressable>
        </View>

        <Pressable style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>Them vao gio</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f5f7' },
  content: { padding: 12, paddingBottom: 20, gap: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, backgroundColor: '#f3f5f7' },
  image: { width: '100%', height: 260, borderRadius: 14, backgroundColor: '#eee' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  },
  name: { fontSize: 22, fontWeight: '700', color: '#111827' },
  price: { fontSize: 20, fontWeight: '800', color: '#111827' },
  desc: { color: '#4b5563', lineHeight: 20 },
  label: { fontWeight: '700', color: '#111827', marginTop: 4 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff'
  },
  optionBtnActive: { backgroundColor: '#111827', borderColor: '#111827' },
  optionText: { color: '#374151', fontWeight: '600' },
  optionTextActive: { color: '#fff' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 24 },
  qtyValueBox: {
    minWidth: 58,
    height: 40,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  qtyValue: { fontSize: 18, fontWeight: '700' },
  addBtn: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  muted: { color: '#6b7280' },
  error: { color: '#b91c1c', textAlign: 'center' },
  retryBtn: { backgroundColor: '#111827', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '700' }
});
