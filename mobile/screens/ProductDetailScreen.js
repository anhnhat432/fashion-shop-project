import React, { useEffect, useState } from 'react';
import { Alert, Button, Image, StyleSheet, Text, TextInput, View } from 'react-native';
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
      setSize(data.sizes?.[0] || '');
      setColor(data.colors?.[0] || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được chi tiết sản phẩm');
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
    if (Number.isNaN(qty) || qty < 1) return Alert.alert('Lỗi', 'Số lượng không hợp lệ');

    addToCart({
      productId: product._id,
      name: product.name,
      image: product.image,
      price: Number(product.price),
      quantity: qty,
      size,
      color
    });
    Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
    navigation.navigate('Cart');
  };

  if (loading) return <Text style={{ padding: 20 }}>Loading...</Text>;
  if (error) return <View style={{ padding: 20, gap: 10 }}><Text>{error}</Text><Button title="Thử lại" onPress={fetchDetail} /></View>;

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image || 'https://picsum.photos/200' }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text>{product.description}</Text>
      <Text>Giá: {Number(product.price || 0).toLocaleString()} đ</Text>
      <TextInput style={styles.input} value={size} onChangeText={setSize} placeholder="Size" />
      <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="Màu" />
      <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="Số lượng" />
      <Button title="Thêm vào giỏ" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  image: { width: '100%', height: 220, borderRadius: 12 },
  name: { fontSize: 22, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 }
});
