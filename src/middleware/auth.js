const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return error(res, 'Access denied. No token provided.', 401);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, 'Invalid or expired token.', 401);
  }
};

const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return error(res, 'Forbidden: insufficient permissions.', 403);
  next();
};

module.exports = { auth, allowRoles };
