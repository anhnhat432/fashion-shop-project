const express = require("express");
const {
  register,
  login,
  me,
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
router.get("/me/wishlist", protect, getWishlist);
router.post("/wishlist/:productId", protect, addToWishlist);
router.delete("/wishlist/:productId", protect, removeFromWishlist);

module.exports = router;
