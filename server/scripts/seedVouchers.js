const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Voucher = require("../models/Voucher");

dotenv.config();

const vouchers = [
  {
    code: "WELCOME10",
    type: "PERCENT",
    value: 10,
    minOrderValue: 300000,
    maxDiscount: 80000,
    isActive: true,
  },
  {
    code: "FREESHIP30",
    type: "FIXED",
    value: 30000,
    minOrderValue: 250000,
    maxDiscount: 0,
    isActive: true,
  },
];

const seedVouchers = async () => {
  try {
    await connectDB();

    for (const voucher of vouchers) {
      await Voucher.findOneAndUpdate({ code: voucher.code }, voucher, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
    }

    console.log("Voucher seed successful");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedVouchers();
