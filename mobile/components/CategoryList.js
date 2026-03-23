import React from "react";
import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
import { FONTS } from "../constants/fonts";

export default function CategoryList({ categories, selectedId, onSelect }) {
  return (
    <View>
      <Text style={styles.title}>Danh mục</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {categories.map((category) => {
          const active = selectedId === category._id;
          return (
            <Pressable
              key={category._id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSelect(category._id)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: FONTS.medium,
  },
  list: { paddingRight: 6, gap: 8 },
  chip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: "#111827", borderColor: "#111827" },
  chipText: { color: "#374151", fontWeight: "600", fontFamily: FONTS.medium },
  chipTextActive: { color: "#fff" },
});
