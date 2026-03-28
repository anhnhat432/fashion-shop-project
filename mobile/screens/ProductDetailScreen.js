import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FONTS } from "../constants/fonts";
import { useWishlist } from "../context/WishlistContext";

const fallbackSizes = ["S", "M", "L"];
const fallbackColors = ["Đen", "Trắng"];
const reviewToneMap = {
  1: { label: "Cần cải thiện", color: "#b91c1c", bg: "#fee2e2" },
  2: { label: "Tạm ổn", color: "#7c3aed", bg: "#ede9fe" },
  3: { label: "Ổn", color: "#0369a1", bg: "#e0f2fe" },
  4: { label: "Rất tốt", color: "#166534", bg: "#dcfce7" },
  5: { label: "Rất đáng mua", color: "#4f46e5", bg: "#eef2ff" },
};

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { addToCart, cartItems } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sharing, setSharing] = useState(false);
  const introAnim = useRef(new Animated.Value(0)).current;
  const mainImgOpacity = useRef(new Animated.Value(0)).current;
  const sizeOptions = useMemo(() => {
    if (product?.variants?.length) {
      return [...new Set(product.variants.map((item) => item.size))];
    }

    return product?.sizes?.length ? product.sizes : fallbackSizes;
  }, [product]);
  const colorOptions = useMemo(() => {
    if (product?.variants?.length) {
      return [
        ...new Set(
          product.variants
            .filter((item) => item.size === size)
            .map((item) => item.color),
        ),
      ];
    }

    return product?.colors?.length ? product.colors : fallbackColors;
  }, [product, size]);

  // Reset color khi size thay đổi nếu color hiện tại không còn hợp lệ
  useEffect(() => {
    if (colorOptions.length > 0 && !colorOptions.includes(color)) {
      setColor(colorOptions[0]);
    }
  }, [colorOptions]);
  const activeVariant = useMemo(() => {
    if (!product?.variants?.length) {
      return null;
    }

    return (
      product.variants.find(
        (item) => item.size === size && item.color === color,
      ) || null
    );
  }, [color, product, size]);
  const stock = Number(activeVariant?.stock ?? product?.stock ?? 0);
  const cartQuantityForVariant = useMemo(() => {
    if (!product) {
      return 0;
    }

    return cartItems.reduce((sum, item) => {
      const isSameVariant =
        item.productId === product._id &&
        item.size === size &&
        item.color === color;

      return isSameVariant ? sum + Number(item.quantity || 0) : sum;
    }, 0);
  }, [cartItems, color, product, size]);
  const remainingStock = Math.max(0, stock - cartQuantityForVariant);
  const basePrice = Number(product?.salePrice || product?.price || 0);
  const averageRating = Number(product?.averageRating || 0);
  const reviewCount = Number(
    product?.reviewCount || product?.reviews?.length || 0,
  );
  const isLiked = product ? isWishlisted(product._id) : false;
  const ratingBreakdown = useMemo(() => {
    const reviews = product?.reviews || [];

    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter(
        (item) => Number(item.rating) === star,
      ).length;
      return {
        star,
        count,
        ratio: reviews.length ? count / reviews.length : 0,
      };
    });
  }, [product]);
  const reviewTone = reviewToneMap[reviewRating] || reviewToneMap[5];

  const fetchDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/products/${productId}`);
      const data = res.data.data;
      const sizeOptions = data.variants?.length
        ? [...new Set(data.variants.map((item) => item.size))]
        : data.sizes?.length
          ? data.sizes
          : fallbackSizes;
      const colorOptions = data.variants?.length
        ? [
            ...new Set(
              data.variants
                .filter((item) => item.size === sizeOptions[0])
                .map((item) => item.color),
            ),
          ]
        : data.colors?.length
          ? data.colors
          : fallbackColors;
      const myReview = (data.reviews || []).find(
        (item) => item.userId === (user?._id || user?.id),
      );

      setProduct(data);
      setActiveImage(0);
      setSize(sizeOptions[0]);
      setColor(colorOptions[0]);
      setQuantity(1);
      setReviewRating(Number(myReview?.rating || 5));
      setReviewComment(myReview?.comment || "");

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

  useEffect(() => {
    introAnim.setValue(0);
    Animated.timing(introAnim, {
      toValue: 1,
      duration: 360,
      useNativeDriver: true,
    }).start();
  }, [productId, introAnim]);

  useEffect(() => {
    if (!product) {
      return;
    }

    setQuantity((prev) => {
      if (remainingStock <= 0) {
        return 1;
      }

      return Math.min(prev, remainingStock);
    });
  }, [product, remainingStock]);

  useEffect(() => {
    if (colorOptions.length && !colorOptions.includes(color)) {
      setColor(colorOptions[0]);
    }
  }, [color, colorOptions]);

  const changeQty = (delta) => {
    setQuantity((prev) => {
      if (remainingStock <= 0) {
        return 1;
      }

      return Math.max(1, Math.min(prev + delta, remainingStock));
    });
  };

  const addSelectedProduct = () => {
    if (!product) return { ok: false, outOfStock: true };

    if (remainingStock <= 0) {
      return { ok: false, outOfStock: true };
    }

    const result = addToCart({
      productId: product._id,
      name: product.name,
      image: product.image,
      price: basePrice,
      quantity,
      size,
      color,
      availableStock: stock,
    });

    return {
      ok: !result.outOfStock && result.addedQuantity > 0,
      ...result,
    };
  };

  const handleAdd = () => {
    const result = addSelectedProduct();
    if (!result.ok) {
      Alert.alert(
        "Thông báo",
        "Sản phẩm này không còn đủ tồn kho để thêm vào giỏ",
      );
      return;
    }

    Alert.alert(
      "Thành công",
      result.capped
        ? "Đã thêm tối đa theo số lượng còn trong kho"
        : "Đã thêm vào giỏ hàng",
    );
    navigation.navigate("MainTabs", { screen: "Cart" });
  };

  const handleBuyNow = () => {
    const result = addSelectedProduct();
    if (!result.ok) {
      Alert.alert("Thông báo", "Sản phẩm này không còn đủ tồn kho để mua ngay");
      return;
    }

    navigation.navigate("Checkout");
  };

  const handleToggleWishlist = async () => {
    if (!product) {
      return;
    }

    try {
      await toggleWishlist(product);
    } catch (wishlistError) {
      Alert.alert(
        "Lỗi",
        wishlistError.response?.data?.message || "Không thể cập nhật danh sách yêu thích",
      );
    }
  };

  const submitReview = async () => {
    setSavingReview(true);
    try {
      const res = await api.post(`/products/${productId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setProduct(res.data.data);
      Alert.alert("Thành công", "Đánh giá của bạn đã được lưu");
    } catch (reviewError) {
      Alert.alert(
        "Lỗi",
        reviewError.response?.data?.message || "Không thể lưu đánh giá",
      );
    } finally {
      setSavingReview(false);
    }
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

  const imageGallery = [
    product.image,
    ...(product.colors || []).slice(0, 2).map(() => product.image),
  ].filter(Boolean);
  const selectedImage =
    imageGallery[activeImage] || "https://picsum.photos/300";
  const selectedTotal = basePrice * quantity;
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} scrollEventThrottle={16}>
      <Animated.View
        style={{
          opacity: introAnim,
          transform: [
            {
              translateY: introAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        }}
      >
        <View style={styles.mediaWrap}>
          <View style={styles.imagePlaceholder}>
            <Animated.Image
              source={{ uri: selectedImage }}
              style={[styles.image, { opacity: mainImgOpacity }]}
              onLoad={() => {
                Animated.timing(mainImgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
              }}
            />
          </View>
          <View style={styles.imageBadgeRow}>
            <View style={styles.editorBadge}>
              <Text style={styles.editorBadgeText}>Gợi ý nổi bật</Text>
            </View>
            <View style={styles.imageActions}>
              <Pressable
                style={styles.favoriteBtn}
                onPress={handleToggleWishlist}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={18}
                  color={isLiked ? "#dc2626" : "#111827"}
                />
              </Pressable>
              <View style={[styles.stockBadge, stockTone]}>
                <Text style={styles.stockBadgeText}>{stockText}</Text>
              </View>
            </View>
          </View>
          <View style={styles.quickInfoStrip}>
            <View style={styles.quickInfoChip}>
              <Ionicons name="sparkles-outline" size={14} color="#4f46e5" />
              <Text style={styles.quickInfoText}>Dáng tối giản</Text>
            </View>
            <View style={styles.quickInfoChip}>
              <Ionicons name="flash-outline" size={14} color="#4f46e5" />
              <Text style={styles.quickInfoText}>Mẫu bán chạy</Text>
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
                onPress={() => {
                  mainImgOpacity.setValue(0);
                  setActiveImage(index);
                  Animated.timing(mainImgOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
                }}
              >
                <Image source={{ uri: image }} style={styles.thumbImage} />
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.card}>
          <View style={styles.metaTopRow}>
            <Text style={styles.categoryText}>
              {product.categoryId?.name || "Thời trang cơ bản"}
            </Text>
            <Text style={styles.ratingText}>
              ★ {averageRating.toFixed(1)} từ {reviewCount} đánh giá
            </Text>
          </View>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{basePrice.toLocaleString()} đ</Text>
          {product.salePrice ? (
            <Text style={styles.oldPrice}>
              {Number(product.price || 0).toLocaleString()} đ
            </Text>
          ) : null}
          <Text style={styles.desc}>
            {product.description || "Sản phẩm demo cho môn học"}
          </Text>

          <View style={styles.selectionSummary}>
            <View style={styles.selectionPill}>
              <Text style={styles.selectionLabel}>Kích cỡ</Text>
              <Text style={styles.selectionValue}>{size}</Text>
            </View>
            <View style={styles.selectionPill}>
              <Text style={styles.selectionLabel}>Màu</Text>
              <Text style={styles.selectionValue}>{color}</Text>
            </View>
            <View style={styles.selectionPill}>
              <Text style={styles.selectionLabel}>Tạm tính</Text>
              <Text style={styles.selectionValue}>
                {selectedTotal.toLocaleString()} đ
              </Text>
            </View>
          </View>

          <View style={styles.highlightGrid}>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightValue}>Miễn phí giao hàng</Text>
              <Text style={styles.highlightLabel}>Đơn từ 499.000 đ</Text>
            </View>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightValue}>Đổi 7 ngày</Text>
              <Text style={styles.highlightLabel}>
                Giữ trải nghiệm mua dễ hơn
              </Text>
            </View>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightValue}>Dễ phối</Text>
              <Text style={styles.highlightLabel}>
                Hợp đồ đi học và đi chơi
              </Text>
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
                    style={[
                      styles.optionText,
                      active && styles.optionTextActive,
                    ]}
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
                    style={[
                      styles.optionText,
                      active && styles.optionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Số lượng</Text>
          <Text style={styles.stockHint}>
            {remainingStock > 0
              ? `Có thể thêm tối đa ${remainingStock} sản phẩm với lựa chọn hiện tại`
              : "Biến thể này đã hết hàng trong giỏ hoặc ngoài kho"}
          </Text>
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

          <Pressable
            style={[
              styles.addBtn,
              remainingStock <= 0 && styles.actionDisabled,
            ]}
            onPress={handleAdd}
            disabled={remainingStock <= 0}
          >
            <Ionicons name="bag-add-outline" size={16} color="#4f46e5" />
            <Text style={styles.addBtnText}>Thêm vào giỏ</Text>
          </Pressable>
          <Pressable
            style={[
              styles.buyBtn,
              remainingStock <= 0 && styles.actionDisabled,
            ]}
            onPress={handleBuyNow}
            disabled={remainingStock <= 0}
          >
            <Ionicons name="arrow-forward" size={16} color="#fff" />
            <Text style={styles.buyBtnText}>Mua ngay</Text>
          </Pressable>
          <Pressable
            style={styles.shareBtn}
            onPress={async () => {
              if (sharing) return;
              setSharing(true);
              try {
                await Share.share({
                  message: `${product.name} - ${Number(product.salePrice || product.price || 0).toLocaleString()} đ | Fashion Shop`,
                });
              } catch (_) {
                // user cancelled or share failed
              } finally {
                setSharing(false);
              }
            }}
          >
            <Ionicons name="share-social-outline" size={16} color="#4f46e5" />
            <Text style={styles.shareBtnText}>Chia sẻ</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.relatedHeader}>
            <Text style={styles.relatedTitle}>Đánh giá sản phẩm</Text>
            <Text style={styles.relatedMeta}>{reviewCount} lượt đánh giá</Text>
          </View>

          <View style={styles.reviewOverviewCard}>
            <View>
              <Text style={styles.reviewOverviewScore}>
                {averageRating.toFixed(1)}
              </Text>
              <Text style={styles.reviewOverviewText}>
                Điểm trung bình từ khách đã mua
              </Text>
            </View>
            <View style={styles.reviewBreakdownList}>
              {ratingBreakdown.map((item) => (
                <View key={item.star} style={styles.reviewBreakdownRow}>
                  <Text style={styles.reviewBreakdownLabel}>{item.star}★</Text>
                  <View style={styles.reviewBreakdownTrack}>
                    <View
                      style={[
                        styles.reviewBreakdownFill,
                        {
                          width: `${Math.max(item.ratio * 100, item.count ? 8 : 0)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.reviewBreakdownCount}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.reviewComposerHeader}>
            <View>
              <Text style={styles.reviewComposerTitle}>
                Viết đánh giá của bạn
              </Text>
              <Text style={styles.reviewComposerText}>
                Mô tả nhanh cảm giác mặc, dáng áo hoặc chất liệu để người sau dễ
                quyết định hơn.
              </Text>
            </View>
            <View
              style={[
                styles.reviewToneBadge,
                { backgroundColor: reviewTone.bg },
              ]}
            >
              <Text
                style={[styles.reviewToneText, { color: reviewTone.color }]}
              >
                {reviewTone.label}
              </Text>
            </View>
          </View>

          <View style={styles.reviewStarsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setReviewRating(star)}>
                <Ionicons
                  name={star <= reviewRating ? "star" : "star-outline"}
                  size={22}
                  color="#f59e0b"
                />
              </Pressable>
            ))}
          </View>

          <View style={styles.reviewInputShell}>
            <TextInput
              style={styles.reviewInput}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm"
              placeholderTextColor="#9ca3af"
              multiline
            />
          </View>

          <Pressable
            style={[styles.addBtn, savingReview && styles.actionDisabled]}
            onPress={submitReview}
            disabled={savingReview}
          >
            <Text style={styles.addBtnText}>
              {savingReview ? "Đang lưu..." : "Gửi đánh giá"}
            </Text>
          </Pressable>

          {(product.reviews || []).length ? (
            (product.reviews || []).map((review, index) => (
              <View key={`${review.userId}-${index}`} style={styles.reviewCard}>
                <View style={styles.reviewHead}>
                  <View>
                    <Text style={styles.reviewName}>{review.name}</Text>
                    <Text style={styles.reviewMeta}>
                      {new Date(
                        review.updatedAt || review.createdAt || Date.now(),
                      ).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>
                  <Text style={styles.reviewRating}>★ {review.rating}</Text>
                </View>
                <Text style={styles.reviewComment}>
                  {review.comment || "Khách hàng chưa để lại nhận xét."}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.reviewEmptyCard}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={22}
                color="#9ca3af"
              />
              <View style={styles.reviewEmptyCopy}>
                <Text style={styles.reviewEmptyTitle}>Chưa có đánh giá nào</Text>
                <Text style={styles.reviewEmptyText}>
                  Bạn có thể là người đầu tiên để lại cảm nhận cho sản phẩm này.
                </Text>
              </View>
            </View>
          )}
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
                    {Number(item.price || 0).toLocaleString()} đ
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.storyCard}>
          <Text style={styles.storyTitle}>Vì sao sản phẩm này dễ bán</Text>
          <Text style={styles.storyText}>
            Dáng mặc an toàn, dễ phối với jeans, chân váy hoặc khoác thêm áo ngoài.
            Nếu bạn đang demo ứng dụng, đây là kiểu nội dung giúp trang chi tiết bớt
            trống và nhìn giống sản phẩm thật hơn.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  content: { padding: 12, paddingBottom: 20, gap: 10 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#f1f5f9",
  },
  mediaWrap: { position: "relative" },
  imagePlaceholder: {
    width: "100%",
    height: 320,
    borderRadius: 22,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 320,
    borderRadius: 22,
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
  imageActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  quickInfoStrip: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    flexDirection: "row",
    gap: 8,
  },
  quickInfoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.88)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickInfoText: { color: "#1e293b", fontSize: 12, fontFamily: FONTS.medium },
  editorBadge: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editorBadgeText: {
    color: "#4f46e5",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  favoriteBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  stockBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  stockBadgeReady: { backgroundColor: "rgba(22, 101, 52, 0.9)" },
  stockBadgeLow: { backgroundColor: "rgba(180, 83, 9, 0.92)" },
  stockBadgeSoldOut: { backgroundColor: "rgba(153, 27, 27, 0.92)" },
  stockBadgeText: { color: "#fff", fontSize: 11, fontFamily: FONTS.bold },
  galleryRow: { paddingTop: 2, gap: 10 },
  thumbWrap: { borderRadius: 16, padding: 4, backgroundColor: "#e5e7eb" },
  thumbWrapActive: { backgroundColor: "#1e293b" },
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
    color: "#4f46e5",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  ratingText: { color: "#6b7280", fontSize: 12, fontFamily: FONTS.medium },
  name: { fontSize: 22, color: "#1e293b", fontFamily: FONTS.bold },
  price: { fontSize: 20, color: "#1e293b", fontFamily: FONTS.bold },
  oldPrice: {
    color: "#9ca3af",
    textDecorationLine: "line-through",
    fontFamily: FONTS.regular,
  },
  desc: { color: "#4b5563", lineHeight: 20, fontFamily: FONTS.regular },
  selectionSummary: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectionPill: {
    borderRadius: 16,
    backgroundColor: "#eef2ff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  selectionLabel: {
    color: "#4f46e5",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontFamily: FONTS.medium,
  },
  selectionValue: { color: "#1e293b", fontFamily: FONTS.bold },
  highlightGrid: { gap: 8 },
  highlightCard: {
    backgroundColor: "#eef2ff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    gap: 4,
  },
  highlightValue: { color: "#1e293b", fontSize: 15, fontFamily: FONTS.bold },
  highlightLabel: {
    color: "#4f46e5",
    lineHeight: 18,
    fontFamily: FONTS.regular,
  },
  label: { color: "#1e293b", marginTop: 4, fontFamily: FONTS.bold },
  stockHint: { color: "#6b7280", fontFamily: FONTS.regular },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionBtn: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  optionBtnActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  optionText: { color: "#374151", fontFamily: FONTS.medium },
  optionTextActive: { color: "#fff" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    color: "#fff",
    fontSize: 22,
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
  qtyValue: { fontSize: 18, fontFamily: FONTS.bold },
  addBtn: {
    backgroundColor: "#eef2ff",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  addBtnText: { color: "#1e293b", fontSize: 16, fontFamily: FONTS.bold },
  buyBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buyBtnText: { color: "#fff", fontSize: 16, fontFamily: FONTS.bold },
  shareBtn: {
    borderWidth: 1.5,
    borderColor: "#c7d2fe",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#eef2ff",
  },
  shareBtnText: { color: "#4f46e5", fontSize: 16, fontFamily: FONTS.bold },
  actionDisabled: { opacity: 0.5 },
  reviewOverviewCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
  },
  reviewOverviewScore: {
    color: "#1e293b",
    fontSize: 28,
    fontFamily: FONTS.bold,
  },
  reviewOverviewText: { color: "#6b7280", fontFamily: FONTS.regular },
  reviewBreakdownList: { gap: 8 },
  reviewBreakdownRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  reviewBreakdownLabel: { width: 28, color: "#1e293b", fontFamily: FONTS.bold },
  reviewBreakdownTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  reviewBreakdownFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#f59e0b",
  },
  reviewBreakdownCount: {
    width: 20,
    textAlign: "right",
    color: "#6b7280",
    fontFamily: FONTS.medium,
  },
  reviewComposerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  reviewComposerTitle: {
    color: "#1e293b",
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  reviewComposerText: {
    color: "#6b7280",
    lineHeight: 18,
    fontFamily: FONTS.regular,
    maxWidth: 250,
  },
  reviewToneBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reviewToneText: { fontFamily: FONTS.bold, fontSize: 12 },
  reviewStarsRow: { flexDirection: "row", gap: 8 },
  reviewInputShell: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 12,
  },
  reviewInput: {
    minHeight: 80,
    textAlignVertical: "top",
    color: "#1e293b",
    fontFamily: FONTS.regular,
  },
  reviewCard: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
    gap: 4,
  },
  reviewHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  reviewName: { color: "#1e293b", fontFamily: FONTS.bold },
  reviewMeta: {
    color: "#9ca3af",
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  reviewRating: { color: "#4f46e5", fontFamily: FONTS.bold },
  reviewComment: {
    color: "#6b7280",
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  reviewEmptyCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    backgroundColor: "#f9fafb",
  },
  reviewEmptyCopy: { flex: 1, gap: 2 },
  reviewEmptyTitle: { color: "#1e293b", fontFamily: FONTS.bold },
  reviewEmptyText: {
    color: "#6b7280",
    lineHeight: 18,
    fontFamily: FONTS.regular,
  },
  relatedSection: { gap: 10, marginTop: 4 },
  relatedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  relatedTitle: { fontSize: 18, color: "#1e293b", fontFamily: FONTS.bold },
  relatedMeta: { color: "#6b7280", fontFamily: FONTS.regular },
  relatedList: { gap: 12, paddingRight: 4 },
  relatedCard: {
    width: 190,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 10,
    gap: 8,
  },
  relatedImage: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    backgroundColor: "#eee",
  },
  relatedCardName: { color: "#1e293b", fontFamily: FONTS.bold },
  relatedCardPrice: { color: "#4f46e5", fontFamily: FONTS.bold },
  storyCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  storyTitle: { color: "#1e293b", fontSize: 17, fontFamily: FONTS.bold },
  storyText: { color: "#6b7280", lineHeight: 20, fontFamily: FONTS.regular },
  muted: { color: "#6b7280", fontFamily: FONTS.regular },
  error: { color: "#b91c1c", textAlign: "center", fontFamily: FONTS.regular },
  retryBtn: {
    backgroundcolor: "#1e293b",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontFamily: FONTS.bold },
});

