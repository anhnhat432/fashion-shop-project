const Order = require("../models/Order");
const Product = require("../models/Product");

const ALLOWED_PAYMENT_METHODS = ["COD", "BANK_TRANSFER"];
const ALLOWED_PAYMENT_STATUS = ["PENDING", "PAID"];
const ALLOWED_ORDER_STATUS = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
];

const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      phone,
      paymentMethod,
      bankTransferConfirmed,
      paymentNote,
      transferReference,
    } = req.body;

    if (
      !Array.isArray(items) ||
      !items.length ||
      !shippingAddress?.trim() ||
      !phone?.trim()
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "items, shippingAddress, phone are required",
        });
    }

    const requestedItems = items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      size: item.size || "",
      color: item.color || "",
    }));

    const hasInvalidItem = requestedItems.some(
      (item) =>
        !item.productId || Number.isNaN(item.quantity) || item.quantity < 1,
    );
    if (hasInvalidItem) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order items" });
    }

    const quantityByProductId = requestedItems.reduce((accumulator, item) => {
      const key = String(item.productId);
      accumulator[key] = (accumulator[key] || 0) + item.quantity;
      return accumulator;
    }, {});

    const productIds = Object.keys(quantityByProductId);
    const products = await Product.find({ _id: { $in: productIds } }).select(
      "name image price stock sizes colors",
    );
    const productMap = new Map(
      products.map((product) => [String(product._id), product]),
    );

    if (products.length !== productIds.length) {
      return res
        .status(400)
        .json({ success: false, message: "Some products no longer exist" });
    }

    for (const [productId, totalRequestedQty] of Object.entries(
      quantityByProductId,
    )) {
      const product = productMap.get(productId);
      if (!product || product.stock < totalRequestedQty) {
        return res
          .status(409)
          .json({ success: false, message: "Some items are out of stock" });
      }
    }

    const normalizedItems = [];
    for (const item of requestedItems) {
      const product = productMap.get(String(item.productId));

      if (!product) {
        return res
          .status(400)
          .json({ success: false, message: "Some products no longer exist" });
      }

      const hasSizeOptions =
        Array.isArray(product.sizes) && product.sizes.length;
      const hasColorOptions =
        Array.isArray(product.colors) && product.colors.length;

      if (hasSizeOptions && !product.sizes.includes(item.size)) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Invalid size selected for ${product.name}`,
          });
      }

      if (hasColorOptions && !product.colors.includes(item.color)) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Invalid color selected for ${product.name}`,
          });
      }

      normalizedItems.push({
        productId: product._id,
        name: product.name,
        image: product.image || "",
        price: Number(product.price),
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      });
    }

    const selectedPaymentMethod = paymentMethod || "COD";
    if (!ALLOWED_PAYMENT_METHODS.includes(selectedPaymentMethod)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment method" });
    }

    if (selectedPaymentMethod === 'BANK_TRANSFER' && !bankTransferConfirmed) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm the simulated bank transfer before placing the order',
      });
    }

    const itemsSubtotal = normalizedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    const shippingFee = itemsSubtotal >= 499000 ? 0 : 30000;
    const totalAmount = itemsSubtotal + shippingFee;

    const normalizedPaymentNote =
      typeof paymentNote === 'string' && paymentNote.trim()
        ? paymentNote.trim()
        : selectedPaymentMethod === 'BANK_TRANSFER'
          ? 'Đã xác nhận chuyển khoản mô phỏng'
          : 'Thanh toán khi nhận hàng';

    const normalizedTransferReference =
      selectedPaymentMethod === 'BANK_TRANSFER' && typeof transferReference === 'string'
        ? transferReference.trim().slice(0, 40)
        : '';

    const paymentStatus = selectedPaymentMethod === 'BANK_TRANSFER' ? 'PAID' : 'PENDING';

    const stockUpdates = Object.entries(quantityByProductId).map(
      ([productId, quantity]) => ({
        updateOne: {
          filter: { _id: productId, stock: { $gte: quantity } },
          update: { $inc: { stock: -quantity } },
        },
      }),
    );

    const stockUpdateResult = await Product.bulkWrite(stockUpdates);
    if (stockUpdateResult.modifiedCount !== stockUpdates.length) {
      return res
        .status(409)
        .json({
          success: false,
          message:
            "Stock changed before checkout. Please review your cart again",
        });
    }

    let order;
    try {
      order = await Order.create({
        userId: req.user._id,
        items: normalizedItems,
        shippingFee,
        totalAmount,
        shippingAddress: shippingAddress.trim(),
        phone: phone.trim(),
        paymentMethod: selectedPaymentMethod,
        paymentStatus,
        paymentNote: normalizedPaymentNote,
        transferReference: normalizedTransferReference,
      });
    } catch (error) {
      await Product.bulkWrite(
        Object.entries(quantityByProductId).map(([productId, quantity]) => ({
          updateOne: {
            filter: { _id: productId },
            update: { $inc: { stock: quantity } },
          },
        })),
      );
      throw error;
    }

    res
      .status(201)
      .json({ success: true, message: "Order created", data: order });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!ALLOWED_ORDER_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    next(error);
  }
};

const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;

    if (!ALLOWED_PAYMENT_STATUS.includes(paymentStatus)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment status" });
    }

    const update = {
      paymentStatus,
      paymentNote:
        paymentStatus === "PAID"
          ? "Admin đã xác nhận thanh toán"
          : "Đơn hàng đang chờ thanh toán",
    };

    if (paymentStatus === "PENDING") {
      update.transferReference = "";
    }

    const order = await Order.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Payment status updated", data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
};
