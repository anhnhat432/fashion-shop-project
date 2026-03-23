const Voucher = require("../models/Voucher");

const getVoucherQuote = async (code, subtotal) => {
  const normalizedCode = code?.trim().toUpperCase();

  if (!normalizedCode) {
    return { voucher: null, discountAmount: 0 };
  }

  const voucher = await Voucher.findOne({
    code: normalizedCode,
    isActive: true,
  });
  if (!voucher) {
    return { error: "Voucher does not exist or is inactive" };
  }

  if (subtotal < Number(voucher.minOrderValue || 0)) {
    return {
      error: `Voucher requires a minimum order of ${Number(voucher.minOrderValue || 0).toLocaleString()} đ`,
    };
  }

  let discountAmount =
    voucher.type === "PERCENT"
      ? (subtotal * Number(voucher.value || 0)) / 100
      : Number(voucher.value || 0);

  if (voucher.maxDiscount > 0) {
    discountAmount = Math.min(discountAmount, Number(voucher.maxDiscount));
  }

  discountAmount = Math.max(0, Math.min(Math.round(discountAmount), subtotal));

  return { voucher, discountAmount };
};

module.exports = { getVoucherQuote };
