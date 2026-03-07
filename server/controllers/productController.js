const Product = require('../models/Product');

const normalizePayload = (payload) => ({
  ...payload,
  name: payload.name?.trim(),
  price: payload.price !== undefined ? Number(payload.price) : undefined,
  stock: payload.stock !== undefined ? Number(payload.stock) : undefined,
  sizes: Array.isArray(payload.sizes) ? payload.sizes : [],
  colors: Array.isArray(payload.colors) ? payload.colors : []
});

const getProducts = async (req, res, next) => {
  try {
    const { search, categoryId } = req.query;
    const query = {};

    if (search) query.name = { $regex: search, $options: 'i' };
    if (categoryId) query.categoryId = categoryId;

    const products = await Product.find(query).populate('categoryId', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'name');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);
    if (!payload.name || Number.isNaN(payload.price) || !payload.categoryId) {
      return res.status(400).json({ success: false, message: 'name, valid price, categoryId are required' });
    }

    const product = await Product.create(payload);
    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);
    if (payload.price !== undefined && Number.isNaN(payload.price)) {
      return res.status(400).json({ success: false, message: 'Price must be a number' });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product updated', data: product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
