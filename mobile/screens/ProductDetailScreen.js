import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { FONTS } from "../constants/fonts";

const fallbackSizes = ["S", "M", "L"];
const fallbackColors = ["Đen", "Trắng"];

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/products/${productId}`);
      const data = res.data.data;
      const sizeOptions = data.sizes?.length ? data.sizes : fallbackSizes;
      const colorOptions = data.colors?.length ? data.colors : fallbackColors;

      setProduct(data);
      setActiveImage(0);
      setSize(sizeOptions[0]);
      setColor(colorOptions[0]);
      setQuantity(1);

      if (data.categoryId?._id || data.categoryId) {
        const categoryId = data.categoryId?._id || data.categoryId;
        const relatedRes = await api.get("/products", {
          params: { categoryId },
        });
        const nextRelatedProducts = (relatedRes.data.data || []).filter(
          (item) => item._id !== data._id,
        );
        setRelatedProducts(nextRelatedProducts.slice(0, 6));
      } else {
        setRelatedProducts([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Không tải được chi tiết sản phẩm",
      );
      setRelatedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [productId]);

  const changeQty = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAdd = () => {
    if (!product) return;

    addToCart({
      productId: product._id,
      name: product.name,
      image: product.image,
      price: Number(product.price),
      quantity,
      size,
      color,
    });

    Alert.alert("Thành công", "Đã thêm vào giỏ hàng");
    navigation.navigate("Cart");
  };

  const handleBuyNow = () => {
    if (!product) return;

    addToCart({
      productId: product._id,
      name: product.name,
      image: product.image,
      price: Number(product.price),
      quantity,
      size,
      color,
    });

    navigation.navigate("Checkout");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Đang tải chi tiết...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={fetchDetail}>
          <Text style={styles.retryText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  const sizeOptions = product.sizes?.length ? product.sizes : fallbackSizes;
  const colorOptions = product.colors?.length ? product.colors : fallbackColors;
  const stock = Number(product.stock || 0);
  const imageGallery = [
    product.image,
    ...(product.colors || []).slice(0, 2).map(() => product.image),
  ].filter(Boolean);
  const selectedImage =
    imageGallery[activeImage] || "https://picsum.photos/300";
  const stockTone =
    stock === 0
      ? styles.stockBadgeSoldOut
      : stock <= 5
        ? styles.stockBadgeLow
        : styles.stockBadgeReady;
  const stockText =
    stock === 0
      ? "Hết hàng"
      : stock <= 5
        ? `Sắp hết, còn ${stock}`
        : `Có sẵn ${stock} sản phẩm`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.mediaWrap}>
        <Image source={{ uri: selectedImage }} style={styles.image} />
        <View style={styles.imageBadgeRow}>
          <View style={styles.editorBadge}>
            <Text style={styles.editorBadgeText}>Editor pick</Text>
          </View>
          <View style={[styles.stockBadge, stockTone]}>
            <Text style={styles.stockBadgeText}>{stockText}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.galleryRow}
      >
        {imageGallery.map((image, index) => {
          const isActive = index === activeImage;
          return (
            <Pressable
              key={`${image}-${index}`}
              style={[styles.thumbWrap, isActive && styles.thumbWrapActive]}
              onPress={() => setActiveImage(index)}
            >
              <Image source={{ uri: image }} style={styles.thumbImage} />
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.card}>
        <View style={styles.metaTopRow}>
          <Text style={styles.categoryText}>
            {product.categoryId?.name || "Fashion essentials"}
          </Text>
          <Text style={styles.ratingText}>4.8/5 từ 126 đánh giá</Text>
        </View>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>
          {Number(product.price || 0).toLocaleString()} d
        </Text>
        <Text style={styles.desc}>
          {product.description || "Sản phẩm demo cho môn học"}
        </Text>

        <View style={styles.highlightGrid}>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightValue}>Free ship</Text>
            <Text style={styles.highlightLabel}>Đơn từ 499.000 đ</Text>
          </View>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightValue}>Đổi 7 ngày</Text>
            <Text style={styles.highlightLabel}>
              Giữ trải nghiệm mua dễ hơn
            </Text>
          </View>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightValue}>Mix dễ</Text>
            <Text style={styles.highlightLabel}>Hợp đồ đi học và đi chơi</Text>
          </View>
        </View>

        <Text style={styles.label}>Chọn size</Text>
        <View style={styles.optionRow}>
          {sizeOptions.map((item) => {
            const active = item === size;
            return (
              <Pressable
                key={item}
                style={[styles.optionBtn, active && styles.optionBtnActive]}
                onPress={() => setSize(item)}
              >
                <Text
                  style={[styles.optionText, active && styles.optionTextActive]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Chọn màu</Text>
        <View style={styles.optionRow}>
          {colorOptions.map((item) => {
            const active = item === color;
            return (
              <Pressable
                key={item}
                style={[styles.optionBtn, active && styles.optionBtnActive]}
                onPress={() => setColor(item)}
              >
                <Text
                  style={[styles.optionText, active && styles.optionTextActive]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Số lượng</Text>
        <View style={styles.qtyRow}>
          <Pressable style={styles.qtyBtn} onPress={() => changeQty(-1)}>
            <Text style={styles.qtyBtnText}>-</Text>
          </Pressable>
          <View style={styles.qtyValueBox}>
            <Text style={styles.qtyValue}>{quantity}</Text>
          </View>
          <Pressable style={styles.qtyBtn} onPress={() => changeQty(1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </Pressable>
        </View>

        <Pressable style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>Thêm vào giỏ</Text>
        </Pressable>
        <Pressable style={styles.buyBtn} onPress={handleBuyNow}>
          <Text style={styles.buyBtnText}>Mua ngay</Text>
        </Pressable>
      </View>

      {relatedProducts.length ? (
        <View style={styles.relatedSection}>
          <View style={styles.relatedHeader}>
            <Text style={styles.relatedTitle}>Có thể bạn cũng thích</Text>
            <Text style={styles.relatedMeta}>Cùng danh mục</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedList}
          >
            {relatedProducts.map((item) => (
              <Pressable
                key={item._id}
                style={styles.relatedCard}
                onPress={() =>
                  navigation.replace("ProductDetail", { productId: item._id })
                }
              >
                <Image
                  source={{ uri: item.image || "https://picsum.photos/220" }}
                  style={styles.relatedImage}
                />
                <Text style={styles.relatedCardName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.relatedCardPrice}>
                  {Number(item.price || 0).toLocaleString()} d
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.storyCard}>
        <Text style={styles.storyTitle}>Vì sao item này dễ bán</Text>
        <Text style={styles.storyText}>
          Form an toàn, phối nhanh với jeans, chân váy hoặc layer áo khoác. Nếu
          bạn đang demo app, đây là kiểu nội dung giúp trang chi tiết bớt trống
          và nhìn giống sản phẩm thật hơn.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f5f7" },
  content: { padding: 12, paddingBottom: 20, gap: 10 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#f3f5f7",
  },
  mediaWrap: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 320,
    borderRadius: 22,
    backgroundColor: "#eee",
  },
  imageBadgeRow: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  editorBadge: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editorBadgeText: {
    color: "#9a3412",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  stockBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stockBadgeReady: { backgroundColor: "rgba(22, 101, 52, 0.9)" },
  stockBadgeLow: { backgroundColor: "rgba(180, 83, 9, 0.92)" },
  stockBadgeSoldOut: { backgroundColor: "rgba(153, 27, 27, 0.92)" },
  stockBadgeText: { color: "#fff", fontSize: 11, fontFamily: FONTS.bold },
  galleryRow: { paddingTop: 2, gap: 10 },
  thumbWrap: {
    borderRadius: 16,
    padding: 4,
    backgroundColor: "#e5e7eb",
  },
  thumbWrapActive: {
    backgroundColor: "#111827",
  },
  thumbImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  metaTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  categoryText: {
    color: "#9a3412",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  ratingText: {
    color: "#6b7280",
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    fontFamily: FONTS.bold,
  },
  price: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    fontFamily: FONTS.bold,
  },
  desc: { color: "#4b5563", lineHeight: 20, fontFamily: FONTS.regular },
  highlightGrid: {
    gap: 8,
  },
  highlightCard: {
    backgroundColor: "#fff7ed",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fdba74",
    gap: 4,
  },
  highlightValue: {
    color: "#111827",
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  highlightLabel: {
    color: "#9a3412",
    lineHeight: 18,
    fontFamily: FONTS.regular,
  },
  label: {
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
    fontFamily: FONTS.bold,
  },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionBtn: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  optionBtnActive: { backgroundColor: "#111827", borderColor: "#111827" },
  optionText: { color: "#374151", fontWeight: "600", fontFamily: FONTS.medium },
  optionTextActive: { color: "#fff" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
    fontFamily: FONTS.bold,
  },
  qtyValueBox: {
    minWidth: 58,
    height: 40,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  qtyValue: { fontSize: 18, fontWeight: "700", fontFamily: FONTS.bold },
  addBtn: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    fontFamily: FONTS.bold,
  },
  buyBtn: {
    backgroundColor: "#fff7ed",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fdba74",
  },
  buyBtnText: {
    color: "#9a3412",
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  relatedSection: {
    gap: 12,
  },
  relatedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  relatedTitle: {
    color: "#111827",
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  relatedMeta: {
    color: "#6b7280",
    fontFamily: FONTS.medium,
  },
  relatedList: {
    gap: 10,
    paddingRight: 8,
  },
  relatedCard: {
    width: 170,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 10,
    gap: 8,
  },
  relatedImage: {
    width: "100%",
    height: 150,
    borderRadius: 14,
    backgroundColor: "#eee",
  },
  relatedCardName: {
    color: "#111827",
    lineHeight: 20,
    fontFamily: FONTS.bold,
  },
  relatedCardPrice: {
    color: "#9a3412",
    fontFamily: FONTS.bold,
  },
  storyCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  storyTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  storyText: {
    color: "#d1d5db",
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  muted: { color: "#6b7280", fontFamily: FONTS.regular },
  error: { color: "#b91c1c", textAlign: "center", fontFamily: FONTS.regular },
  retryBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "700", fontFamily: FONTS.bold },
});
