const User = require("../models/User");

// @desc  Get all users (admin only)
// @route GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select("-password -wishlist")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc  Update user role (admin only)
// @route PUT /api/users/:id/role
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role không hợp lệ" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password -wishlist");

    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy user" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, updateUserRole };
