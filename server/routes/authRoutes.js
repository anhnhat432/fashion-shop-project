const express = require("express");
const {
  register,
  login,
  me,
  changePassword,
  updateMe,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.put("/me", protect, updateMe);
router.put("/me/change-password", protect, changePassword);
router.get("/me/wishlist", protect, getWishlist);
router.post("/wishlist/:productId", protect, addToWishlist);
router.delete("/wishlist/:productId", protect, removeFromWishlist);

module.exports = router;
