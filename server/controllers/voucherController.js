const Order = require("../models/Order");
const Voucher = require("../models/Voucher");
const { getVoucherQuote } = require("../utils/voucherUtils");

const VOUCHER_WARNING_THRESHOLD = 3;

const attachVoucherUsage = async (vouchers) => {
  const usageStats = await Order.aggregate([
    { $match: { voucherCode: { $exists: true, $ne: "" } } },
    {
      $group: {
        _id: "$voucherCode",
        usageCount: { $sum: 1 },
        lastUsedAt: { $max: "$createdAt" },
      },
    },
  ]);

  const usageMap = new Map(
    usageStats.map((item) => [String(item._id).toUpperCase(), item]),
  );

  return vouchers.map((voucher) => {
    const voucherObject = voucher.toObject ? voucher.toObject() : voucher;
    const usage = usageMap.get(String(voucherObject.code || "").toUpperCase());

    return {
      ...voucherObject,
      usageCount: Number(usage?.usageCount || 0),
      lastUsedAt: usage?.lastUsedAt || null,
      isHeavilyUsed:
        Number(usage?.usageCount || 0) >= VOUCHER_WARNING_THRESHOLD,
      archiveReasonLabel:
        voucherObject.archiveReason === "USED_HEAVILY"
          ? "Used heavily"
          : voucherObject.archiveReason === "MANUAL"
            ? "Manual archive"
            : "-",
    };
  });
};

const normalizeVoucherPayload = (payload = {}) => ({
  code: payload.code?.trim()?.toUpperCase(),
  type: payload.type,
  value: payload.value !== undefined ? Number(payload.value) : undefined,
  minOrderValue:
    payload.minOrderValue !== undefined ? Number(payload.minOrderValue) : 0,
  maxDiscount:
    payload.maxDiscount !== undefined ? Number(payload.maxDiscount) : 0,
  isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
});

const validateVoucherPayload = (
  { code, type, value, minOrderValue, maxDiscount },
  isPartial = false,
) => {
  if (!isPartial || code !== undefined) {
    if (!code || code.length < 3) {
      return "Voucher code must be at least 3 characters";
    }
  }

  if (!isPartial || type !== undefined) {
    if (!["PERCENT", "FIXED"].includes(type)) {
      return "Voucher type must be PERCENT or FIXED";
    }
  }

  if (!isPartial || value !== undefined) {
    if (Number.isNaN(value) || value <= 0) {
      return "Voucher value must be greater than 0";
    }
  }

  if (!isPartial || minOrderValue !== undefined) {
    if (Number.isNaN(minOrderValue) || minOrderValue < 0) {
      return "Minimum order value must be 0 or greater";
    }
  }

  if (!isPartial || maxDiscount !== undefined) {
    if (Number.isNaN(maxDiscount) || maxDiscount < 0) {
      return "Max discount must be 0 or greater";
    }
  }

  return "";
};

const listVouchers = async (req, res, next) => {
  try {
    const vouchers = await Voucher.find({ archivedAt: null }).sort({
      createdAt: -1,
      code: 1,
    });
    res.json({ success: true, data: await attachVoucherUsage(vouchers) });
  } catch (error) {
    next(error);
  }
};

const listArchivedVouchers = async (req, res, next) => {
  try {
    const vouchers = await Voucher.find({ archivedAt: { $ne: null } }).sort({
      archivedAt: -1,
      code: 1,
    });
    res.json({ success: true, data: await attachVoucherUsage(vouchers) });
  } catch (error) {
    next(error);
  }
};

const createVoucher = async (req, res, next) => {
  try {
    const payload = normalizeVoucherPayload(req.body);
    const validationError = validateVoucherPayload(payload);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const existingVoucher = await Voucher.findOne({ code: payload.code });
    if (existingVoucher) {
      return res
        .status(400)
        .json({ success: false, message: "Voucher code already exists" });
    }

    const voucher = await Voucher.create(payload);
    const [enrichedVoucher] = await attachVoucherUsage([voucher]);
    res.status(201).json({
      success: true,
      message: "Voucher created",
      data: enrichedVoucher,
    });
  } catch (error) {
    next(error);
  }
};

const updateVoucher = async (req, res, next) => {
  try {
    const payload = normalizeVoucherPayload(req.body);
    const validationError = validateVoucherPayload(payload, true);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    if (payload.code) {
      const existingVoucher = await Voucher.findOne({
        code: payload.code,
        _id: { $ne: req.params.id },
      });
      if (existingVoucher) {
        return res
          .status(400)
          .json({ success: false, message: "Voucher code already exists" });
      }
    }

    const voucher = await Voucher.findOneAndUpdate(
      { _id: req.params.id, archivedAt: null },
      payload,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Voucher not found" });
    }

    const [enrichedVoucher] = await attachVoucherUsage([voucher]);
    res.json({
      success: true,
      message: "Voucher updated",
      data: enrichedVoucher,
    });
  } catch (error) {
    next(error);
  }
};

const deleteVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findOne({
      _id: req.params.id,
      archivedAt: null,
    });
    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Voucher not found" });
    }

    const usageCount = await Order.countDocuments({
      voucherCode: voucher.code,
    });

    if (usageCount >= VOUCHER_WARNING_THRESHOLD) {
      voucher.isActive = false;
      voucher.archivedAt = new Date();
      voucher.archiveReason = "USED_HEAVILY";
      await voucher.save();

      return res.json({
        success: true,
        message:
          "Voucher was heavily used, so it was archived instead of permanently deleted",
        data: { mode: "soft-delete", usageCount },
      });
    }

    await voucher.deleteOne();

    res.json({
      success: true,
      message: "Voucher deleted",
      data: { mode: "hard-delete", usageCount },
    });
  } catch (error) {
    next(error);
  }
};

const restoreVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findOne({
      _id: req.params.id,
      archivedAt: { $ne: null },
    });
    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Archived voucher not found" });
    }

    const shouldActivate = Boolean(req.body?.activate);
    voucher.archivedAt = null;
    voucher.isActive = shouldActivate;
    voucher.archiveReason = null;
    await voucher.save();

    const [enrichedVoucher] = await attachVoucherUsage([voucher]);
    res.json({
      success: true,
      message: shouldActivate
        ? "Voucher restored and activated"
        : "Voucher restored in inactive state",
      data: enrichedVoucher,
    });
  } catch (error) {
    next(error);
  }
};

const validateVoucher = async (req, res, next) => {
  try {
    const subtotal = Number(req.query.subtotal || 0);
    if (Number.isNaN(subtotal) || subtotal < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Subtotal is invalid" });
    }

    const { voucher, discountAmount, error } = await getVoucherQuote(
      req.params.code,
      subtotal,
    );
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    res.json({
      success: true,
      data: {
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        minOrderValue: voucher.minOrderValue,
        maxDiscount: voucher.maxDiscount,
        discountAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listVouchers,
  listArchivedVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  restoreVoucher,
  validateVoucher,
};
