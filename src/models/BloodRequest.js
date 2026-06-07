const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodGroup: { type: String, required: true, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  city: { type: String, required: true },
  urgency: { type: String, enum: ['critical', 'urgent', 'normal'], default: 'normal' },
  matchedDonors: [{
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
    response: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
  }],
  status: { type: String, enum: ['open', 'fulfilled', 'cancelled'], default: 'open' },
  resolvedAt: { type: Date },
}, { timestamps: true });

bloodRequestSchema.index({ status: 1, bloodGroup: 1, city: 1 });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
