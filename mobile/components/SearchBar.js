import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar({ value, onChangeText, onSearch }) {
  return (
    <View style={styles.wrapper}>
      <Ionicons name="search-outline" size={18} color="#6b7280" />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Tim san pham"
        returnKeyType="search"
        onSubmitEditing={onSearch}
      />
      <Pressable style={styles.button} onPress={onSearch}>
        <Text style={styles.buttonText}>Tim</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  input: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 15, color: '#111827' },
  button: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  buttonText: { color: '#fff', fontWeight: '700' }
});
