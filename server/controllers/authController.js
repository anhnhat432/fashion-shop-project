const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address
});

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!name?.trim() || !normalizedEmail || !password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Name, email, password(>=6) are required' });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password, phone, address, role: 'user' });
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Register successful',
      data: { token, user: sanitizeUser(user) }
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
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);
    res.json({
      success: true,
      message: 'Login successful',
      data: { token, user: sanitizeUser(user) }
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({ success: true, data: sanitizeUser(req.user) });
};

module.exports = { register, login, me };
