const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const { getVoucherQuote } = require("../utils/voucherUtils");

const FREE_SHIPPING_THRESHOLD = 499000;
const SHIPPING_FEE = 30000;
const BANK_TRANSFER_CONFIRM_WINDOW_MINUTES = 10;

const ALLOWED_PAYMENT_METHODS = ["COD", "BANK_TRANSFER"];
const ALLOWED_PAYMENT_STATUS = ["PENDING", "PAID"];
const ALLOWED_ORDER_STATUS = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
];

const ORDER_STATUS_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

const buildPaymentDeadline = () =>
  new Date(
    Date.now() + BANK_TRANSFER_CONFIRM_WINDOW_MINUTES * 60 * 1000,
  );

const buildPaymentNote = ({ paymentMethod, paymentStatus }) => {
  if (paymentStatus === "PAID") {
    return paymentMethod === "BANK_TRANSFER"
      ? "Admin đã xác nhận chuyển khoản mô phỏng"
      : "Admin đã xác nhận đơn đã thanh toán";
  }

  return paymentMethod === "BANK_TRANSFER"
    ? "Đơn đang chờ shop xác nhận chuyển khoản mô phỏng"
    : "Thanh toán khi nhận hàng";
};

const buildVariantKey = (productId, size, color) =>
  `${String(productId)}::${size || ""}::${color || ""}`;

const buildStockAdjustmentOperations = (items, productMap, direction) => {
  const groupedItems = items.reduce((accumulator, item) => {
    const key = buildVariantKey(item.productId, item.size, item.color);
    if (!accumulator[key]) {
      accumulator[key] = {
        productId: String(item.productId),
        size: item.size || "",
        color: item.color || "",
        quantity: 0,
      };
    }
    accumulator[key].quantity += Number(item.quantity || 0);
    return accumulator;
  }, {});

  return Object.values(groupedItems).map((item) => {
    const product = productMap.get(String(item.productId));
    const hasVariants =
      Array.isArray(product?.variants) && product.variants.length;

    if (hasVariants) {
      return {
        updateOne: {
          filter: {
            _id: item.productId,
            "variants.size": item.size,
            "variants.color": item.color,
            ...(direction < 0
              ? { "variants.stock": { $gte: item.quantity } }
              : {}),
          },
          update: {
            $inc: {
              stock: direction * item.quantity,
              "variants.$.stock": direction * item.quantity,
            },
          },
        },
      };
    }

    return {
      updateOne: {
        filter: {
          _id: item.productId,
          ...(direction < 0 ? { stock: { $gte: item.quantity } } : {}),
        },
        update: { $inc: { stock: direction * item.quantity } },
      },
    };
  });
};

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
      voucherCode,
    } = req.body;

    if (
      !Array.isArray(items) ||
      !items.length ||
      !shippingAddress?.trim() ||
      !phone?.trim()
    ) {
      return res.status(400).json({
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

    const productIds = [
      ...new Set(requestedItems.map((item) => String(item.productId))),
    ];

    const hasInvalidObjectId = productIds.some(
      (id) => !mongoose.Types.ObjectId.isValid(id),
    );
    if (hasInvalidObjectId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID format" });
    }
    const products = await Product.find({ _id: { $in: productIds } }).select(
      "name image price salePrice stock sizes colors variants",
    );
    const productMap = new Map(
      products.map((product) => [String(product._id), product]),
    );

    if (products.length !== productIds.length) {
      return res
        .status(400)
        .json({ success: false, message: "Some products no longer exist" });
    }

    const groupedItems = requestedItems.reduce((accumulator, item) => {
      const key = buildVariantKey(item.productId, item.size, item.color);
      accumulator[key] = (accumulator[key] || 0) + item.quantity;
      return accumulator;
    }, {});

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
      const hasVariants =
        Array.isArray(product.variants) && product.variants.length;

      if (hasSizeOptions && !product.sizes.includes(item.size)) {
        return res.status(400).json({
          success: false,
          message: `Invalid size selected for ${product.name}`,
        });
      }

      if (hasColorOptions && !product.colors.includes(item.color)) {
        return res.status(400).json({
          success: false,
          message: `Invalid color selected for ${product.name}`,
        });
      }

      if (hasVariants) {
        const matchedVariant = product.variants.find(
          (variant) =>
            variant.size === item.size && variant.color === item.color,
        );

        if (!matchedVariant) {
          return res.status(400).json({
            success: false,
            message: `Selected size/color combination is unavailable for ${product.name}`,
          });
        }

        const reservedQuantity =
          groupedItems[
            buildVariantKey(item.productId, item.size, item.color)
          ] || 0;
        if (matchedVariant.stock < reservedQuantity) {
          return res.status(409).json({
            success: false,
            message: "Some selected variants are out of stock",
          });
        }
      } else if (
        product.stock <
        (groupedItems[buildVariantKey(item.productId, item.size, item.color)] ||
          0)
      ) {
        return res
          .status(409)
          .json({ success: false, message: "Some items are out of stock" });
      }

      normalizedItems.push({
        productId: product._id,
        name: product.name,
        image: product.image || "",
        price: Number(product.salePrice || product.price),
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

    if (selectedPaymentMethod === "BANK_TRANSFER" && !bankTransferConfirmed) {
      return res.status(400).json({
        success: false,
        message:
          "Please confirm the simulated bank transfer before placing the order",
      });
    }

    const itemsSubtotal = normalizedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    const {
      voucher,
      discountAmount,
      error: voucherError,
    } = await getVoucherQuote(voucherCode, itemsSubtotal);
    if (voucherError) {
      return res.status(400).json({ success: false, message: voucherError });
    }

    const shippingFee =
      itemsSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const totalAmount = itemsSubtotal - discountAmount + shippingFee;

    const normalizedPaymentNote =
      selectedPaymentMethod === "BANK_TRANSFER"
        ? "Khách đã gửi yêu cầu xác nhận chuyển khoản mô phỏng"
        : typeof paymentNote === "string" && paymentNote.trim()
          ? paymentNote.trim()
          : "Thanh toán khi nhận hàng";

    const normalizedTransferReference =
      selectedPaymentMethod === "BANK_TRANSFER"
        ? typeof transferReference === "string" && transferReference.trim()
          ? transferReference.trim().slice(0, 40)
          : `FSHOP-${Date.now().toString().slice(-8)}`
        : "";

    const paymentStatus = "PENDING";
    const paymentDeadlineAt =
      selectedPaymentMethod === "BANK_TRANSFER" ? buildPaymentDeadline() : null;

    const stockUpdates = buildStockAdjustmentOperations(
      normalizedItems,
      productMap,
      -1,
    );

    const stockUpdateResult = await Product.bulkWrite(stockUpdates);
    if (stockUpdateResult.modifiedCount !== stockUpdates.length) {
      return res.status(409).json({
        success: false,
        message: "Stock changed before checkout. Please review your cart again",
      });
    }

    let order;
    try {
      order = await Order.create({
        userId: req.user._id,
        items: normalizedItems,
        shippingFee,
        discountAmount,
        voucherCode: voucher?.code || "",
        totalAmount,
        shippingAddress: shippingAddress.trim(),
        phone: phone.trim(),
        paymentMethod: selectedPaymentMethod,
        paymentStatus,
        paymentNote: normalizedPaymentNote,
        transferReference: normalizedTransferReference,
        paymentDeadlineAt,
        paidAt: null,
      });
    } catch (error) {
      await Product.bulkWrite(
        buildStockAdjustmentOperations(normalizedItems, productMap, 1),
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

const cancelMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled by the customer",
      });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Paid orders cannot be cancelled by the customer",
      });
    }

    const productIds = [
      ...new Set((order.items || []).map((item) => String(item.productId))),
    ];
    const products = await Product.find({ _id: { $in: productIds } }).select(
      "variants stock",
    );
    const productMap = new Map(
      products.map((product) => [String(product._id), product]),
    );
    const restoreOperations = buildStockAdjustmentOperations(
      order.items || [],
      productMap,
      1,
    );
    if (restoreOperations.length) {
      await Product.bulkWrite(restoreOperations);
    }

    order.status = "CANCELLED";
    await order.save();

    res.json({ success: true, message: "Order cancelled", data: order });
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

    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.status === status) {
      return res.json({
        success: true,
        message: "Order status unchanged",
        data: order,
      });
    }

    const allowedNextStatuses = ORDER_STATUS_TRANSITIONS[order.status] || [];
    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from ${order.status} to ${status}`,
      });
    }

    if (
      status === "CONFIRMED" &&
      order.paymentMethod === "BANK_TRANSFER" &&
      order.paymentStatus !== "PAID"
    ) {
      return res.status(400).json({
        success: false,
        message: "Bank transfer orders must be marked as paid before confirming",
      });
    }

    if (status === "CANCELLED") {
      const productIds = [
        ...new Set((order.items || []).map((item) => String(item.productId))),
      ];
      const products = await Product.find({ _id: { $in: productIds } }).select(
        "variants stock",
      );
      const productMap = new Map(
        products.map((product) => [String(product._id), product]),
      );
      const restoreOperations = buildStockAdjustmentOperations(
        order.items || [],
        productMap,
        1,
      );
      if (restoreOperations.length) {
        await Product.bulkWrite(restoreOperations);
      }
    }

    order.status = status;
    await order.save();

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

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.status === "CANCELLED" && paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Cancelled orders cannot be marked as paid",
      });
    }

    order.paymentStatus = paymentStatus;
    order.paymentNote = buildPaymentNote({
      paymentMethod: order.paymentMethod,
      paymentStatus,
    });
    order.paidAt = paymentStatus === "PAID" ? new Date() : null;

    if (order.paymentMethod === "BANK_TRANSFER") {
      order.paymentDeadlineAt =
        paymentStatus === "PAID"
          ? order.paymentDeadlineAt
          : buildPaymentDeadline();
    } else {
      order.paymentDeadlineAt = null;
    }

    await order.save();

    res.json({ success: true, message: "Payment status updated", data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  cancelMyOrder,
  updateOrderStatus,
  updatePaymentStatus,
};
