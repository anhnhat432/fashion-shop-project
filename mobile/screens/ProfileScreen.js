import React from 'react';
import { Button, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>{user?.name}</Text>
      <Text>Email: {user?.email}</Text>
      <Text>SĐT: {user?.phone || '-'}</Text>
      <Text>Địa chỉ: {user?.address || '-'}</Text>
      <Button title="Lịch sử đơn hàng" onPress={() => navigation.navigate('OrderHistory')} />
      <Button title="Đăng xuất" onPress={logout} />
    </View>
  );
}
