import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) return Alert.alert('Loi', 'Vui long nhap email va mat khau');
    if (!normalizedEmail.includes('@')) return Alert.alert('Loi', 'Email khong hop le');

    setLoading(true);
    try {
      await login(normalizedEmail, password);
    } catch (error) {
      Alert.alert('Loi', error.response?.data?.message || 'Dang nhap that bai');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Fashion Shop</Text>
        <Text style={styles.subtitle}>Dang nhap de tiep tuc mua sam</Text>

        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Mat khau" secureTextEntry value={password} onChangeText={setPassword} />

        <Pressable style={[styles.primaryBtn, loading && styles.disabled]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Dang nhap</Text>}
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Chua co tai khoan? Dang ky ngay</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#f3f5f7' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 10, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: '#666', textAlign: 'center', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, backgroundColor: '#fafafa' },
  primaryBtn: { backgroundColor: '#111827', borderRadius: 10, padding: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.65 },
  link: { textAlign: 'center', color: '#2563eb', marginTop: 4 }
});
