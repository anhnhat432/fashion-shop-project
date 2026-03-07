import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });

  const handleRegister = async () => {
    if (!form.name || !form.email || form.password.length < 6) return Alert.alert('Lỗi', 'Thông tin chưa hợp lệ');
    try {
      await register(form);
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký</Text>
      {['name', 'email', 'password', 'phone', 'address'].map((field) => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={field}
          secureTextEntry={field === 'password'}
          value={form[field]}
          onChangeText={(v) => setForm({ ...form, [field]: v })}
          autoCapitalize="none"
        />
      ))}
      <Button title="Tạo tài khoản" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', gap: 10 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 }
});
