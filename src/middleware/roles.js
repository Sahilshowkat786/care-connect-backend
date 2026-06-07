const { error } = require('../utils/response');

const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return error(res, 'Forbidden: insufficient permissions', 403);
  }
  next();
};

module.exports = allowRoles;
