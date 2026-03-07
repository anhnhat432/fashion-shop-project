const Order = require('../models/Order');

const ALLOWED_PAYMENT_METHODS = ['COD', 'BANK_TRANSFER'];
const ALLOWED_ORDER_STATUS = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, phone, paymentMethod } = req.body;

    if (!Array.isArray(items) || !items.length || !shippingAddress?.trim() || !phone?.trim()) {
      return res.status(400).json({ success: false, message: 'items, shippingAddress, phone are required' });
    }

    const normalizedItems = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      image: item.image || '',
      price: Number(item.price),
      quantity: Number(item.quantity),
      size: item.size || '',
      color: item.color || ''
    }));

    const hasInvalidItem = normalizedItems.some((item) => !item.productId || !item.name || Number.isNaN(item.price) || item.price < 0 || Number.isNaN(item.quantity) || item.quantity < 1);
    if (hasInvalidItem) {
      return res.status(400).json({ success: false, message: 'Invalid order items' });
    }

    const selectedPaymentMethod = paymentMethod || 'COD';
    if (!ALLOWED_PAYMENT_METHODS.includes(selectedPaymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    const totalAmount = normalizedItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const order = await Order.create({
      userId: req.user._id,
      items: normalizedItems,
      totalAmount,
      shippingAddress: shippingAddress.trim(),
      phone: phone.trim(),
      paymentMethod: selectedPaymentMethod
    });

    res.status(201).json({ success: true, message: 'Order created', data: order });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!ALLOWED_ORDER_STATUS.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
