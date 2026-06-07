const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bloodGroup: { type: String, required: true, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  city: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  isAvailable: { type: Boolean, default: true },
  lastDonated: { type: Date },
  totalDonations: { type: Number, default: 0 },
}, { timestamps: true });

donorSchema.index({ location: '2dsphere' });
donorSchema.index({ bloodGroup: 1, city: 1, isAvailable: 1 });

module.exports = mongoose.model('Donor', donorSchema);
