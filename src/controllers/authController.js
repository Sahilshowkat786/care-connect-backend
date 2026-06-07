const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { success, error } = require('../utils/response');

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
  const refreshToken = jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, city, bloodGroup } = req.body;
    if (!name || !email || !password || !phone || !city) return error(res, 'All fields are required.');
    if (password.length < 8) return error(res, 'Password must be at least 8 characters.');
    const exists = await User.findOne({ email });
    if (exists) return error(res, 'Email already registered.');
    const user = new User({ name, email, passwordHash: password, role: role || 'patient', phone, city, bloodGroup: bloodGroup || '' });
    await user.save();
    return success(res, null, 'Registration successful. Please login.', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, 'Email and password are required.');
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return error(res, 'Invalid credentials.', 401);
    const valid = await user.comparePassword(password);
    if (!valid) return error(res, 'Invalid credentials.', 401);
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    const userData = { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, city: user.city, bloodGroup: user.bloodGroup };
    return success(res, { user: userData, accessToken, refreshToken }, 'Login successful.');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return error(res, 'Refresh token required.', 401);
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { accessToken, refreshToken: newRefresh } = generateTokens(decoded.userId, decoded.role);
    return success(res, { accessToken, refreshToken: newRefresh }, 'Token refreshed.');
  } catch (err) {
    return error(res, 'Invalid refresh token.', 401);
  }
};

exports.logout = (req, res) => success(res, null, 'Logged out successfully. Please clear your token.');

exports.updatePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;
    await User.findByIdAndUpdate(req.user.userId, { pushToken });
    return success(res, null, 'Push token updated.');
  } catch (err) {
    return error(res, err.message, 500);
  }
};
