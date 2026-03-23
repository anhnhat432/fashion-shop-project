import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import SearchBar from "../components/SearchBar";
import CategoryList from "../components/CategoryList";
import ProductCard from "../components/ProductCard";
import { FONTS } from "../constants/fonts";
import { useCart } from "../context/CartContext";

const allCategory = { _id: "", name: "Tất cả" };

export default function HomeScreen({ navigation }) {
  const { cartCount } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([allCategory]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories([allCategory, ...(res.data.data || [])]);
    } catch (err) {
      setCategories([allCategory]);
    }
  };

  const fetchProducts = async (
    nextSearch = search,
    nextCategoryId = selectedCategoryId,
  ) => {
    setLoading(true);
    setError("");
    try {
      const params = { search: nextSearch.trim() };
      if (nextCategoryId) params.categoryId = nextCategoryId;
      const res = await api.get("/products", { params });
      setProducts(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được sản phẩm");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts("", "");
  }, []);

  const onSearch = () => {
    fetchProducts(search, selectedCategoryId);
  };

  const onSelectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    fetchProducts(search, categoryId);
  };

  const emptyText = useMemo(() => {
    if (search.trim() || selectedCategoryId)
      return "Không tìm thấy sản phẩm phù hợp";
    return "Chưa có sản phẩm";
  }, [search, selectedCategoryId]);

  const inStockCount = useMemo(
    () => products.filter((item) => Number(item.stock || 0) > 0).length,
    [products],
  );

  const lowStockCount = useMemo(
    () =>
      products.filter((item) => {
        const stock = Number(item.stock || 0);
        return stock > 0 && stock <= 5;
      }).length,
    [products],
  );

  const featuredProducts = useMemo(() => products.slice(0, 3), [products]);

  const openProductDetail = (productId) => {
    navigation.getParent()?.navigate("ProductDetail", { productId });
  };

  const renderHeader = () => (
    <View style={styles.headerWrap}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>Spring edit 2026</Text>
          </View>
          <View style={styles.heroMiniStat}>
            <Text style={styles.heroMiniStatValue}>{cartCount}</Text>
            <Text style={styles.heroMiniStatLabel}>items</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>
          Nâng tủ đồ mỗi ngày với các item dễ phối.
        </Text>
        <Text style={styles.heroSubtitle}>
          Chọn nhanh theo danh mục, xem hàng mới và checkout gọn trong vài bước.
        </Text>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>{products.length}</Text>
            <Text style={styles.heroStatLabel}>Sản phẩm đang hiển thị</Text>
          </View>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>{inStockCount}</Text>
            <Text style={styles.heroStatLabel}>Còn hàng</Text>
          </View>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>{categories.length - 1}</Text>
            <Text style={styles.heroStatLabel}>Danh mục</Text>
          </View>
        </View>
      </View>

      <SearchBar value={search} onChangeText={setSearch} onSearch={onSearch} />

      <CategoryList
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={onSelectCategory}
      />

      <View style={styles.actionRow}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => navigation.navigate("Cart")}
        >
          <View style={styles.actionIconWrap}>
            <Ionicons name="cart-outline" size={18} color="#111827" />
          </View>
          <View style={styles.actionCopyWrap}>
            <Text style={styles.actionText}>Giỏ hàng</Text>
            <Text style={styles.actionSubtext}>{cartCount} sản phẩm</Text>
          </View>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => navigation.navigate("Profile")}
        >
          <View style={styles.actionIconWrap}>
            <Ionicons name="person-outline" size={18} color="#111827" />
          </View>
          <View style={styles.actionCopyWrap}>
            <Text style={styles.actionText}>Tài khoản</Text>
            <Text style={styles.actionSubtext}>Quản lý đơn và hồ sơ</Text>
          </View>
        </Pressable>
      </View>

      {featuredProducts.length ? (
        <View style={styles.curatedWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gợi ý nổi bật</Text>
            <Text style={styles.sectionMeta}>{lowStockCount} món sắp hết</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          >
            {featuredProducts.map((item, index) => (
              <Pressable
                key={item._id}
                style={styles.featuredCard}
                onPress={() => openProductDetail(item._id)}
              >
                <Text style={styles.featuredEyebrow}>
                  #{String(index + 1).padStart(2, "0")}
                </Text>
                <Text style={styles.featuredName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.featuredPrice}>
                  {Number(item.price || 0).toLocaleString()} d
                </Text>
                <Text style={styles.featuredMeta} numberOfLines={1}>
                  {item.categoryId?.name || "Fashion essentials"}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
        <Text style={styles.sectionMeta}>{products.length} kết quả</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" />
          <Text style={styles.muted}>Đang tải sản phẩm...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={onSearch}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => openProductDetail(item._id)}
            />
          )}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 10, backgroundColor: "#f3f5f7" },
  headerWrap: { gap: 14, paddingBottom: 14 },
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroPill: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroPillText: {
    color: "#fde68a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  heroMiniStat: {
    alignItems: "flex-end",
  },
  heroMiniStatValue: {
    color: "#fff",
    fontSize: 20,
    fontFamily: FONTS.bold,
  },
  heroMiniStatLabel: {
    color: "#9ca3af",
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 36,
    fontFamily: FONTS.bold,
  },
  heroSubtitle: {
    color: "#d1d5db",
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  heroStatsRow: { flexDirection: "row", gap: 10 },
  heroStatCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 4,
  },
  heroStatValue: {
    color: "#fff",
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  heroStatLabel: { color: "#cbd5e1", fontSize: 12, fontFamily: FONTS.regular },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopyWrap: {
    flex: 1,
  },
  actionText: { color: "#111827", fontWeight: "700", fontFamily: FONTS.bold },
  actionSubtext: { color: "#6b7280", fontSize: 12, fontFamily: FONTS.regular },
  curatedWrap: { gap: 10 },
  featuredList: { paddingRight: 8, gap: 10 },
  featuredCard: {
    width: 170,
    backgroundColor: "#fff7ed",
    borderRadius: 18,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#fdba74",
  },
  featuredEyebrow: {
    color: "#c2410c",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: FONTS.bold,
  },
  featuredName: {
    color: "#111827",
    fontSize: 16,
    lineHeight: 22,
    fontFamily: FONTS.bold,
  },
  featuredPrice: { color: "#111827", fontSize: 18, fontFamily: FONTS.bold },
  featuredMeta: { color: "#9a3412", fontFamily: FONTS.medium },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  sectionMeta: { color: "#6b7280", fontFamily: FONTS.medium },
  centerBox: { alignItems: "center", marginTop: 30, gap: 8 },
  muted: { color: "#6b7280", fontFamily: FONTS.regular },
  listContent: { paddingTop: 2, paddingBottom: 20 },
  errorBox: {
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  errorText: { color: "#b91c1c", fontFamily: FONTS.regular },
  retryBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryText: { color: "#fff", fontWeight: "700", fontFamily: FONTS.bold },
  empty: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 28,
    fontFamily: FONTS.regular,
  },
});
