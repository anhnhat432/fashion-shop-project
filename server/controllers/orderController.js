const Order = require('../models/Order');

const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, phone, paymentMethod } = req.body;
    if (!items || !items.length || !shippingAddress || !phone) {
      return res.status(400).json({ success: false, message: 'Items, shippingAddress, phone are required' });
    }

    const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const order = await Order.create({
      userId: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      phone,
      paymentMethod: paymentMethod || 'COD'
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
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
