const User = require("../models/User");
const Product = require("../models/Product");
const generateToken = require("../utils/generateToken");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address,
});

const decorateWishlistProduct = (product) => {
  const productObject = product.toObject ? product.toObject() : product;
  const reviews = Array.isArray(productObject.reviews)
    ? productObject.reviews
    : [];
  const stock =
    Array.isArray(productObject.variants) && productObject.variants.length
      ? productObject.variants.reduce(
          (sum, item) => sum + Number(item.stock || 0),
          0,
        )
      : Number(productObject.stock || 0);
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
      reviews.length
    : 0;

  return {
    ...productObject,
    stock,
    averageRating: Number(averageRating.toFixed(1)),
    reviewCount: reviews.length,
  };
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!name?.trim() || !normalizedEmail || !password || password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email, password(>=6) are required",
        });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone,
      address,
      role: "user",
    });
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Register successful",
      data: { token, user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);
    res.json({
      success: true,
      message: "Login successful",
      data: { token, user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({ success: true, data: sanitizeUser(req.user) });
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "currentPassword and newPassword are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: "New password must differ from current password" });
    }

    const user = await User.findById(req.user._id);
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: "Mật khẩu hiện tại không đúng" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const phone = req.body.phone?.trim() || "";
    const address = req.body.address?.trim() || "";

    if (!name || name.length < 2) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name must be at least 2 characters",
        });
    }

    const normalizedPhone = phone.replace(/\D/g, "");
    if (phone && (normalizedPhone.length < 9 || normalizedPhone.length > 11)) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is invalid" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.name = name;
    user.phone = phone;
    user.address = address;
    await user.save();

    res.json({
      success: true,
      message: "Profile updated",
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "wishlist",
        populate: { path: "categoryId", select: "name" },
      })
      .lean(false);

    const wishlist = (user?.wishlist || []).map(decorateWishlistProduct);
    res.json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: product._id } },
      { new: true },
    );

    res.json({
      success: true,
      message: "Added to wishlist",
      data: user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: req.params.productId } },
      { new: true },
    );

    res.json({
      success: true,
      message: "Removed from wishlist",
      data: user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  changePassword,
  updateMe,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
