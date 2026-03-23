import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS } from "../constants/fonts";

export default function SearchBar({ value, onChangeText, onSearch }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.searchCore}>
        <View style={styles.iconShell}>
          <Ionicons name="search-outline" size={18} color="#111827" />
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Tìm jacket, denim, váy midi..."
          placeholderTextColor="#9ca3af"
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
      </View>
      <Pressable style={styles.button} onPress={onSearch}>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
        <Text style={styles.buttonText}>Khám phá</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchCore: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffaf5",
    borderRadius: 18,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#eeded0",
    minHeight: 56,
    shadowColor: "#7c2d12",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconShell: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8e7d7",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
    color: "#111827",
    fontFamily: FONTS.regular,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#111827",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontFamily: FONTS.bold },
});
