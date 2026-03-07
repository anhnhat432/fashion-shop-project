import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/products/${productId}`);
      const data = res.data.data;
      setProduct(data);
      setSize(data.sizes?.[0] || 'M');
      setColor(data.colors?.[0] || 'Den');
    } catch (err) {
      setError(err.response?.data?.message || 'Khong tai duoc chi tiet san pham');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [productId]);

  const handleAdd = () => {
    const qty = Number(quantity);
    if (!product) return;
    if (Number.isNaN(qty) || qty < 1) return Alert.alert('Loi', 'So luong khong hop le');

    addToCart({
      productId: product._id,
      name: product.name,
      image: product.image,
      price: Number(product.price),
      quantity: qty,
      size: size.trim() || 'M',
      color: color.trim() || 'Den'
    });

    Alert.alert('Thanh cong', 'Da them vao gio hang');
    navigation.navigate('Cart');
  };

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" /><Text style={styles.muted}>Dang tai chi tiet...</Text></View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.btn} onPress={fetchDetail}><Text style={styles.btnText}>Thu lai</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image || 'https://picsum.photos/200' }} style={styles.image} />
      <View style={styles.card}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>Gia: {Number(product.price || 0).toLocaleString()} d</Text>
        <Text style={styles.desc}>{product.description || 'San pham demo cho mon hoc'}</Text>

        <TextInput style={styles.input} value={size} onChangeText={setSize} placeholder="Size" />
        <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="Mau" />
        <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="So luong" />

        <Pressable style={styles.btn} onPress={handleAdd}><Text style={styles.btnText}>Them vao gio</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 10, backgroundColor: '#f3f5f7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  image: { width: '100%', height: 240, borderRadius: 12, backgroundColor: '#eee' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, gap: 8 },
  name: { fontSize: 22, fontWeight: '700', color: '#111827' },
  price: { fontWeight: '700' },
  desc: { color: '#4b5563' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10, backgroundColor: '#fff' },
  btn: { backgroundColor: '#111827', borderRadius: 10, padding: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  muted: { color: '#6b7280' },
  error: { color: '#b91c1c', textAlign: 'center' }
});
