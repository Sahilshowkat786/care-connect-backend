const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String, required: true },
  departments: [{ type: String }],
  adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

hospitalSchema.index({ name: 'text' });
hospitalSchema.index({ city: 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);
