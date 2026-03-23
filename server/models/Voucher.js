const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: { type: String, enum: ["PERCENT", "FIXED"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    archivedAt: { type: Date, default: null },
    archiveReason: {
      type: String,
      enum: ["USED_HEAVILY", "MANUAL"],
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Voucher", voucherSchema);
