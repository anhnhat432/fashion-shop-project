import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
import SkeletonBlock from "../components/SkeletonBlock";
import { FONTS } from "../constants/fonts";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const allCategory = { _id: "", name: "Tất cả" };
const sortOptions = [
  { key: "newest", label: "Mới nhất" },
  { key: "price-asc", label: "Giá tăng" },
  { key: "price-desc", label: "Giá giảm" },
  { key: "name-asc", label: "A-Z" },
];

export default function HomeScreen({ navigation }) {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([allCategory]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [sortKey, setSortKey] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [error, setError] = useState("");
  const revealAnim = useRef(new Animated.Value(0)).current;

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
    nextSortKey = sortKey,
    nextInStockOnly = inStockOnly,
  ) => {
    setLoading(true);
    setError("");
    try {
      const params = { search: nextSearch.trim(), sort: nextSortKey };
      if (nextCategoryId) params.categoryId = nextCategoryId;
      if (nextInStockOnly) params.inStock = true;
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
    fetchProducts("", "", "newest", false);
  }, []);

  useEffect(() => {
    if (!loading) {
      revealAnim.setValue(0);
      Animated.timing(revealAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, revealAnim]);

  const onSearch = () => {
    fetchProducts(search, selectedCategoryId, sortKey, inStockOnly);
  };

  const onSelectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    fetchProducts(search, categoryId, sortKey, inStockOnly);
  };

  const onSelectSort = (nextSortKey) => {
    setSortKey(nextSortKey);
    fetchProducts(search, selectedCategoryId, nextSortKey, inStockOnly);
  };

  const onToggleStock = () => {
    const nextInStockOnly = !inStockOnly;
    setInStockOnly(nextInStockOnly);
    fetchProducts(search, selectedCategoryId, sortKey, nextInStockOnly);
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
  const reviewedCount = useMemo(
    () => products.filter((item) => Number(item.reviewCount || 0) > 0).length,
    [products],
  );
  const topRatedProduct = useMemo(() => {
    return (
      [...products].sort(
        (left, right) =>
          Number(right.averageRating || 0) - Number(left.averageRating || 0),
      )[0] || null
    );
  }, [products]);

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

      <View style={styles.filtersWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortList}
        >
          {sortOptions.map((option) => {
            const active = option.key === sortKey;
            return (
              <Pressable
                key={option.key}
                style={[styles.sortChip, active && styles.sortChipActive]}
                onPress={() => onSelectSort(option.key)}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    active && styles.sortChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          style={[styles.stockToggle, inStockOnly && styles.stockToggleActive]}
          onPress={onToggleStock}
        >
          <Ionicons
            name={inStockOnly ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={inStockOnly ? "#166534" : "#6b7280"}
          />
          <Text
            style={[
              styles.stockToggleText,
              inStockOnly && styles.stockToggleTextActive,
            ]}
          >
            Chỉ còn hàng
          </Text>
        </Pressable>
      </View>

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
          onPress={() => navigation.getParent()?.navigate("Wishlist")}
        >
          <View style={styles.actionIconWrap}>
            <Ionicons name="heart-outline" size={18} color="#111827" />
          </View>
          <View style={styles.actionCopyWrap}>
            <Text style={styles.actionText}>Wishlist</Text>
            <Text style={styles.actionSubtext}>{wishlistCount} món đã lưu</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.signalRow}>
        <View style={styles.signalCardDark}>
          <Text style={styles.signalLabelLight}>Wishlist của bạn</Text>
          <Text style={styles.signalValueLight}>{wishlistCount}</Text>
          <Text style={styles.signalMetaLight}>
            Lưu item muốn cân nhắc trước khi checkout
          </Text>
        </View>
        <View style={styles.signalCardLight}>
          <Text style={styles.signalLabel}>Review đang có</Text>
          <Text style={styles.signalValue}>{reviewedCount}</Text>
          <Text style={styles.signalMeta}>
            Sản phẩm đã có feedback từ người mua
          </Text>
        </View>
      </View>

      {topRatedProduct ? (
        <Pressable
          style={styles.reviewSpotlight}
          onPress={() => openProductDetail(topRatedProduct._id)}
        >
          <View>
            <Text style={styles.reviewSpotlightEyebrow}>Review spotlight</Text>
            <Text style={styles.reviewSpotlightTitle} numberOfLines={2}>
              {topRatedProduct.name}
            </Text>
            <Text style={styles.reviewSpotlightMeta}>
              ★ {Number(topRatedProduct.averageRating || 0).toFixed(1)} •{" "}
              {Number(topRatedProduct.reviewCount || 0)} đánh giá
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#111827" />
        </Pressable>
      ) : null}

      <View style={styles.actionRow}>
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
                  {Number(item.salePrice || item.price || 0).toLocaleString()} d
                </Text>
                <View style={styles.featuredMetaRow}>
                  <Text style={styles.featuredMeta} numberOfLines={1}>
                    {item.categoryId?.name || "Fashion essentials"}
                  </Text>
                  <Text style={styles.featuredReview}>
                    ★ {Number(item.averageRating || 0).toFixed(1)}
                  </Text>
                </View>
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

  const renderLoadingState = () => (
    <View style={styles.skeletonWrap}>
      <View style={styles.skeletonHero}>
        <SkeletonBlock style={styles.skeletonPill} />
        <SkeletonBlock style={styles.skeletonTitle} />
        <SkeletonBlock style={styles.skeletonSubtitle} />
        <View style={styles.skeletonStatRow}>
          <SkeletonBlock style={styles.skeletonStatCard} />
          <SkeletonBlock style={styles.skeletonStatCard} />
          <SkeletonBlock style={styles.skeletonStatCard} />
        </View>
      </View>
      <SkeletonBlock style={styles.skeletonSearch} />
      <View style={styles.skeletonChipRow}>
        <SkeletonBlock style={styles.skeletonChip} />
        <SkeletonBlock style={styles.skeletonChip} />
        <SkeletonBlock style={styles.skeletonChip} />
      </View>
      <SkeletonBlock style={styles.skeletonProduct} />
      <SkeletonBlock style={styles.skeletonProduct} />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyCard}>
      <Ionicons name="search-outline" size={34} color="#9ca3af" />
      <Text style={styles.emptyTitle}>{emptyText}</Text>
      <Text style={styles.emptyCaption}>
        Thử đổi từ khóa tìm kiếm hoặc chuyển sang danh mục khác.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? renderLoadingState() : null}

      {!loading && error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={onSearch}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error ? (
        <Animated.View
          style={{
            flex: 1,
            opacity: revealAnim,
            transform: [
              {
                translateY: revealAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          }}
        >
          <FlatList
            data={products}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyState()}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => openProductDetail(item._id)}
              />
            )}
          />
        </Animated.View>
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
  signalRow: { flexDirection: "row", gap: 10 },
  signalCardDark: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  signalCardLight: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  signalLabelLight: {
    color: "#cbd5e1",
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  signalValueLight: { color: "#fff", fontSize: 24, fontFamily: FONTS.bold },
  signalMetaLight: {
    color: "#d1d5db",
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  signalLabel: { color: "#6b7280", fontSize: 12, fontFamily: FONTS.medium },
  signalValue: { color: "#111827", fontSize: 24, fontFamily: FONTS.bold },
  signalMeta: { color: "#6b7280", fontSize: 12, fontFamily: FONTS.regular },
  reviewSpotlight: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fdba74",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  reviewSpotlightEyebrow: {
    color: "#9a3412",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontFamily: FONTS.bold,
  },
  reviewSpotlightTitle: {
    color: "#111827",
    fontSize: 16,
    fontFamily: FONTS.bold,
    marginTop: 4,
  },
  reviewSpotlightMeta: {
    color: "#9a3412",
    marginTop: 4,
    fontFamily: FONTS.medium,
  },
  filtersWrap: { gap: 10 },
  sortList: { gap: 8, paddingRight: 8 },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sortChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  sortChipText: { color: "#374151", fontFamily: FONTS.medium },
  sortChipTextActive: { color: "#fff" },
  stockToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  stockToggleActive: { backgroundColor: "#dcfce7", borderColor: "#86efac" },
  stockToggleText: { color: "#374151", fontFamily: FONTS.medium },
  stockToggleTextActive: { color: "#166534" },
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
  featuredMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  featuredMeta: { color: "#9a3412", fontFamily: FONTS.medium },
  featuredReview: { color: "#111827", fontFamily: FONTS.bold },
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
  skeletonWrap: { gap: 12, paddingTop: 4 },
  skeletonHero: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  skeletonPill: { width: 110, height: 24, borderRadius: 999 },
  skeletonTitle: { width: "82%", height: 32, borderRadius: 12 },
  skeletonSubtitle: { width: "100%", height: 18, borderRadius: 10 },
  skeletonStatRow: { flexDirection: "row", gap: 10 },
  skeletonStatCard: { flex: 1, height: 74, borderRadius: 16 },
  skeletonSearch: { width: "100%", height: 56, borderRadius: 18 },
  skeletonChipRow: { flexDirection: "row", gap: 10 },
  skeletonChip: { width: 92, height: 40, borderRadius: 999 },
  skeletonProduct: { width: "100%", height: 250, borderRadius: 18 },
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
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  emptyTitle: { color: "#111827", fontSize: 18, fontFamily: FONTS.bold },
  emptyCaption: {
    color: "#6b7280",
    textAlign: "center",
    fontFamily: FONTS.regular,
  },
});
