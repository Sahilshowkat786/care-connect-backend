const { error } = require('../utils/response');

const validate = (schema) => (req, res, next) => {
  const { error: err } = schema.validate(req.body, { abortEarly: false });
  if (err) {
    const messages = err.details.map(d => d.message).join(', ');
    return error(res, messages, 400);
  }
  next();
};

module.exports = validate;
