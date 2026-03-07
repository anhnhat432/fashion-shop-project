import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: form.phone.trim(),
      address: form.address.trim()
    };

    if (!payload.name || !payload.email || !payload.password) return Alert.alert('Loi', 'Ten, email, mat khau la bat buoc');
    if (!payload.email.includes('@')) return Alert.alert('Loi', 'Email khong hop le');
    if (payload.password.length < 6) return Alert.alert('Loi', 'Mat khau toi thieu 6 ky tu');
    if (payload.phone && payload.phone.replace(/\D/g, '').length < 9) return Alert.alert('Loi', 'So dien thoai can toi thieu 9 so');

    setLoading(true);
    try {
      await register(payload);
    } catch (error) {
      Alert.alert('Loi', error.response?.data?.message || 'Dang ky that bai');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Tao tai khoan</Text>
        {[
          { key: 'name', label: 'Ho ten' },
          { key: 'email', label: 'Email' },
          { key: 'password', label: 'Mat khau' },
          { key: 'phone', label: 'So dien thoai' },
          { key: 'address', label: 'Dia chi' }
        ].map((item) => (
          <TextInput
            key={item.key}
            style={styles.input}
            placeholder={item.label}
            secureTextEntry={item.key === 'password'}
            value={form[item.key]}
            onChangeText={(v) => setForm({ ...form, [item.key]: v })}
            autoCapitalize="none"
          />
        ))}
        <Pressable style={[styles.primaryBtn, loading && styles.disabled]} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Tao tai khoan</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#f3f5f7' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 10, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, backgroundColor: '#fafafa' },
  primaryBtn: { backgroundColor: '#111827', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.65 }
});
