const express = require("express");
const {
  listVouchers,
  listArchivedVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  restoreVoucher,
  validateVoucher,
} = require("../controllers/voucherController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, listVouchers);
router.get("/archived", protect, adminOnly, listArchivedVouchers);
router.get("/validate/:code", validateVoucher);
router.post("/", protect, adminOnly, createVoucher);
router.put("/:id/restore", protect, adminOnly, restoreVoucher);
router.put("/:id", protect, adminOnly, updateVoucher);
router.delete("/:id", protect, adminOnly, deleteVoucher);

module.exports = router;
