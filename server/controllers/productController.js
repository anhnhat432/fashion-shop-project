const Product = require("../models/Product");
const Category = require("../models/Category");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeVariants = (variants) => {
  if (!Array.isArray(variants)) return [];

  return variants
    .map((item) => ({
      size: item.size?.trim(),
      color: item.color?.trim(),
      stock: Number(item.stock || 0),
    }))
    .filter(
      (item) =>
        item.size && item.color && !Number.isNaN(item.stock) && item.stock >= 0,
    );
};

const enrichProduct = (product) => {
  const productObject = product.toObject ? product.toObject() : product;
  const variants = Array.isArray(productObject.variants)
    ? productObject.variants
    : [];
  const reviews = Array.isArray(productObject.reviews)
    ? productObject.reviews
    : [];
  const stock = variants.length
    ? variants.reduce((sum, item) => sum + Number(item.stock || 0), 0)
    : Number(productObject.stock || 0);
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
      reviews.length
    : 0;

  return {
    ...productObject,
    stock,
    averageRating: Number(averageRating.toFixed(1)),
    reviewCount: reviews.length,
  };
};

const normalizePayload = (payload) => {
  let image = payload.image?.trim() || "";
  // Chỉ chấp nhận URL http/https
  if (image && !/^https?:\/\/.+/.test(image)) {
    image = "";
  }
  return {
    ...payload,
    name: payload.name?.trim(),
    image,
    price: payload.price !== undefined ? Number(payload.price) : undefined,
    salePrice:
      payload.salePrice !== undefined &&
      payload.salePrice !== null &&
      payload.salePrice !== ""
        ? Number(payload.salePrice)
        : null,
    stock: payload.stock !== undefined ? Number(payload.stock) : undefined,
    sizes: Array.isArray(payload.sizes) ? payload.sizes : [],
    colors: Array.isArray(payload.colors) ? payload.colors : [],
    variants: normalizeVariants(payload.variants),
  };
};

const ensureCategoryExists = async (categoryId) => {
  if (!categoryId) return false;
  return Boolean(await Category.exists({ _id: categoryId }));
};

const getProducts = async (req, res, next) => {
  try {
    const { search, categoryId, sort, inStock, page, limit } = req.query;
    const query = {};
    let sortQuery = { createdAt: -1 };

    if (search) query.name = { $regex: escapeRegex(search.trim()), $options: "i" };
    if (categoryId) query.categoryId = categoryId;
    if (inStock === "true") query.stock = { $gt: 0 };

    if (sort === "price-asc") {
      sortQuery = { price: 1, createdAt: -1 };
    } else if (sort === "price-desc") {
      sortQuery = { price: -1, createdAt: -1 };
    } else if (sort === "name-asc") {
      sortQuery = { name: 1, createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("categoryId", "name")
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: products.map(enrichProduct),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "categoryId",
      "name",
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, data: enrichProduct(product) });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);
    if (!payload.name || Number.isNaN(payload.price) || !payload.categoryId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "name, valid price, categoryId are required",
        });
    }
    if (
      payload.salePrice !== null &&
      (Number.isNaN(payload.salePrice) ||
        payload.salePrice <= 0 ||
        payload.salePrice > payload.price)
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Sale price must be positive and less than price",
        });
    }

    if (!(await ensureCategoryExists(payload.categoryId))) {
      return res
        .status(400)
        .json({ success: false, message: "Selected category does not exist" });
    }

    if (payload.variants.length) {
      payload.sizes = [...new Set(payload.variants.map((item) => item.size))];
      payload.colors = [...new Set(payload.variants.map((item) => item.color))];
      payload.stock = payload.variants.reduce(
        (sum, item) => sum + Number(item.stock || 0),
        0,
      );
    }

    const product = await Product.create(payload);
    res
      .status(201)
      .json({
        success: true,
        message: "Product created",
        data: enrichProduct(product),
      });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);
    if (payload.name !== undefined && !payload.name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }
    if (payload.price !== undefined && Number.isNaN(payload.price)) {
      return res
        .status(400)
        .json({ success: false, message: "Price must be a number" });
    }
    if (
      payload.salePrice !== null &&
      payload.salePrice !== undefined &&
      (Number.isNaN(payload.salePrice) || payload.salePrice <= 0)
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Sale price must be a positive number",
        });
    }
    if (
      payload.categoryId !== undefined &&
      !(await ensureCategoryExists(payload.categoryId))
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Selected category does not exist" });
    }

    if (payload.variants.length) {
      payload.sizes = [...new Set(payload.variants.map((item) => item.size))];
      payload.colors = [...new Set(payload.variants.map((item) => item.color))];
      payload.stock = payload.variants.reduce(
        (sum, item) => sum + Number(item.stock || 0),
        0,
      );
    }

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({
      success: true,
      message: "Product updated",
      data: enrichProduct(product),
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};

const addOrUpdateReview = async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    const comment = req.body.comment?.trim() || "";

    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(req.params.id).populate(
      "categoryId",
      "name",
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const existingReviewIndex = product.reviews.findIndex(
      (review) => String(review.userId) === String(req.user._id),
    );

    const payload = {
      userId: req.user._id,
      name: req.user.name,
      rating,
      comment,
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    if (existingReviewIndex >= 0) {
      product.reviews[existingReviewIndex] = {
        ...product.reviews[existingReviewIndex].toObject(),
        ...payload,
        createdAt: product.reviews[existingReviewIndex].createdAt,
      };
    } else {
      product.reviews.push(payload);
    }

    await product.save();
    res.json({
      success: true,
      message: "Review saved",
      data: enrichProduct(product),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addOrUpdateReview,
};
