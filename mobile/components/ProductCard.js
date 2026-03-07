import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProductCard({ product, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onPress}>
      <Image source={{ uri: product.image || 'https://picsum.photos/200' }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>{Number(product.price || 0).toLocaleString()} d</Text>
        <Text style={styles.desc} numberOfLines={2}>{product.description || 'San pham demo cho mon hoc'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  },
  image: { width: '100%', height: 170, backgroundColor: '#f3f4f6' },
  content: { padding: 12, gap: 4 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  price: { fontSize: 18, fontWeight: '800', color: '#111827' },
  desc: { fontSize: 12, color: '#6b7280' }
});
