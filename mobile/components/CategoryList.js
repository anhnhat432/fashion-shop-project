import React from "react";
import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
import { FONTS } from "../constants/fonts";

export default function CategoryList({ categories, selectedId, onSelect }) {
  return (
    <View>
      <View style={styles.headRow}>
        <Text style={styles.title}>Danh mục theo mood</Text>
        <Text style={styles.count}>{categories.length - 1} nhóm</Text>
      </View>
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
  headRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    color: "#111827",
    fontFamily: FONTS.medium,
  },
  count: {
    color: "#9ca3af",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontFamily: FONTS.medium,
  },
  list: { paddingRight: 6, gap: 10 },
  chip: {
    backgroundColor: "#fff8f1",
    borderWidth: 1,
    borderColor: "#eeded0",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipActive: { backgroundColor: "#111827", borderColor: "#111827" },
  chipText: { color: "#7c2d12", fontWeight: "600", fontFamily: FONTS.medium },
  chipTextActive: { color: "#fff" },
});
