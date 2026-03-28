import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [sortKey, setSortKey] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const revealAnim = useRef(new Animated.Value(0)).current;
  const debounceTimer = useRef(null);

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
    pageNum = 1,
    append = false,
  ) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");
    try {
      const params = {
        search: nextSearch.trim(),
        sort: nextSortKey,
        page: pageNum,
        limit: 10,
      };
      if (nextCategoryId) params.categoryId = nextCategoryId;
      if (nextInStockOnly) params.inStock = true;
      const res = await api.get("/products", { params });
      const newProducts = res.data.data || [];
      const pag = res.data.pagination || {};
      if (append) {
        setProducts((prev) => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
        setPage(1);
      }
      setTotal(pag.total || newProducts.length);
      setHasMore(pageNum < (pag.totalPages || 1));
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được sản phẩm");
      if (!append) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts("", "", "newest", false);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
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

  // Debounce: tự động search sau 500ms khi user gõ
  const onSearchTextChange = useCallback(
    (text) => {
      setSearch(text);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        fetchProducts(text, selectedCategoryId, sortKey, inStockOnly);
      }, 500);
    },
    [selectedCategoryId, sortKey, inStockOnly],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCategories(),
      fetchProducts(search, selectedCategoryId, sortKey, inStockOnly, 1, false),
    ]);
    setRefreshing(false);
  }, [search, selectedCategoryId, sortKey, inStockOnly]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(
      search,
      selectedCategoryId,
      sortKey,
      inStockOnly,
      nextPage,
      true,
    );
  }, [
    loadingMore,
    hasMore,
    page,
    search,
    selectedCategoryId,
    sortKey,
    inStockOnly,
  ]);

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
            <Text style={styles.heroPillText}>Bộ sưu tập xuân 2026</Text>
          </View>
          <View style={styles.heroMiniStat}>
            <Text style={styles.heroMiniStatValue}>{cartCount}</Text>
            <Text style={styles.heroMiniStatLabel}>món</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>
          Nâng tủ đồ mỗi ngày với những món dễ phối.
        </Text>
        <Text style={styles.heroSubtitle}>
          Chọn nhanh theo danh mục, xem hàng mới và thanh toán gọn trong vài
          bước.
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

      <SearchBar
        value={search}
        onChangeText={onSearchTextChange}
        onSearch={onSearch}
      />

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
            <Ionicons name="cart-outline" size={18} color="#4f46e5" />
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
            <Ionicons name="heart-outline" size={18} color="#4f46e5" />
            {wishlistCount > 0 ? (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.actionCopyWrap}>
            <Text style={styles.actionText}>Yêu thích</Text>
            <Text style={styles.actionSubtext}>{wishlistCount} món đã lưu</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.signalRow}>
        <View style={styles.signalCardDark}>
          <Text style={styles.signalLabelLight}>Danh sách yêu thích</Text>
          <Text style={styles.signalValueLight}>{wishlistCount}</Text>
          <Text style={styles.signalMetaLight}>
            Lưu món muốn cân nhắc trước khi thanh toán
          </Text>
        </View>
        <View style={styles.signalCardLight}>
          <Text style={styles.signalLabel}>Đánh giá hiện có</Text>
          <Text style={styles.signalValue}>{reviewedCount}</Text>
          <Text style={styles.signalMeta}>
            Sản phẩm đã có phản hồi từ người mua
          </Text>
        </View>
      </View>

      {topRatedProduct ? (
        <Pressable
          style={styles.reviewSpotlight}
          onPress={() => openProductDetail(topRatedProduct._id)}
        >
          <View>
            <Text style={styles.reviewSpotlightEyebrow}>Đánh giá nổi bật</Text>
            <Text style={styles.reviewSpotlightTitle} numberOfLines={2}>
              {topRatedProduct.name}
            </Text>
            <Text style={styles.reviewSpotlightMeta}>
              ★ {Number(topRatedProduct.averageRating || 0).toFixed(1)} •{" "}
              {Number(topRatedProduct.reviewCount || 0)} đánh giá
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#4f46e5" />
        </Pressable>
      ) : null}

      <View style={styles.actionRow}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => navigation.navigate("Profile")}
        >
          <View style={styles.actionIconWrap}>
            <Ionicons name="person-outline" size={18} color="#4f46e5" />
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
                  {Number(item.salePrice || item.price || 0).toLocaleString()} đ
                </Text>
                <View style={styles.featuredMetaRow}>
                  <Text style={styles.featuredMeta} numberOfLines={1}>
                    {item.categoryId?.name || "Thời trang cơ bản"}
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
        <Text style={styles.sectionMeta}>{total} kết quả</Text>
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
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            removeClippedSubviews
            windowSize={10}
            maxToRenderPerBatch={6}
            initialNumToRender={6}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadMoreWrap}>
                  <ActivityIndicator size="small" color="#4f46e5" />
                  <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
                </View>
              ) : !hasMore && products.length > 0 ? (
                <Text style={styles.allLoadedText}>
                  Đã hiển thị đầy đủ {total} sản phẩm
                </Text>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#4f46e5"
                colors={["#4f46e5"]}
              />
            }
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
  container: { flex: 1, padding: 12, gap: 10, backgroundColor: "#f1f5f9" },
  headerWrap: { gap: 14, paddingBottom: 14 },
  heroCard: {
    backgroundColor: "#1e1b4b",
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
    backgroundColor: "rgba(129,140,248,0.2)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(129,140,248,0.3)",
  },
  heroPillText: {
    color: "#a5b4fc",
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
    backgroundColor: "rgba(99,102,241,0.18)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(129,140,248,0.2)",
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
    backgroundColor: "#1e1b4b",
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
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  signalLabelLight: {
    color: "#cbd5e1",
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  signalValueLight: { color: "#a5b4fc", fontSize: 24, fontFamily: FONTS.bold },
  signalMetaLight: {
    color: "#d1d5db",
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  signalLabel: { color: "#6b7280", fontSize: 12, fontFamily: FONTS.medium },
  signalValue: { color: "#111827", fontSize: 24, fontFamily: FONTS.bold },
  signalMeta: { color: "#6b7280", fontSize: 12, fontFamily: FONTS.regular },
  reviewSpotlight: {
    backgroundColor: "#eef2ff",
    borderWidth: 1.5,
    borderColor: "#c7d2fe",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  reviewSpotlightEyebrow: {
    color: "#4f46e5",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontFamily: FONTS.bold,
  },
  reviewSpotlightTitle: {
    color: "#1e1b4b",
    fontSize: 16,
    fontFamily: FONTS.bold,
    marginTop: 4,
  },
  reviewSpotlightMeta: {
    color: "#4f46e5",
    marginTop: 4,
    fontFamily: FONTS.medium,
  },
  filtersWrap: { gap: 10 },
  sortList: { gap: 8, paddingRight: 8 },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  sortChipActive: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  sortChipText: { color: "#475569", fontFamily: FONTS.medium, fontSize: 13 },
  sortChipTextActive: { color: "#fff" },
  stockToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  stockToggleActive: { backgroundColor: "#f0fdf4", borderColor: "#86efac" },
  stockToggleText: { color: "#475569", fontFamily: FONTS.medium, fontSize: 13 },
  stockToggleTextActive: { color: "#16a34a" },
  actionBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingVertical: 11,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#4f46e5",
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  actionBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: FONTS.bold,
    lineHeight: 12,
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
    backgroundColor: "#eef2ff",
    borderRadius: 18,
    padding: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#c7d2fe",
  },
  featuredEyebrow: {
    color: "#4f46e5",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: FONTS.bold,
  },
  featuredName: {
    color: "#0f172a",
    fontSize: 16,
    lineHeight: 22,
    fontFamily: FONTS.bold,
  },
  featuredPrice: { color: "#4f46e5", fontSize: 18, fontFamily: FONTS.bold },
  featuredMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  featuredMeta: { color: "#6366f1", fontFamily: FONTS.medium },
  featuredReview: { color: "#0f172a", fontFamily: FONTS.bold },
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
  loadMoreWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  loadMoreText: { color: "#6b7280", fontFamily: FONTS.medium, fontSize: 13 },
  allLoadedText: {
    textAlign: "center",
    color: "#9ca3af",
    fontFamily: FONTS.regular,
    fontSize: 13,
    paddingVertical: 16,
  },
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
