const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientAge: { type: Number, required: true, min: 0, max: 120 },
  patientGender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  condition: { type: String, required: true },
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-', ''] },
  allergies: { type: String },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'received', 'in_progress', 'resolved'], default: 'pending' },
  acknowledgedAt: { type: Date },
}, { timestamps: true });

alertSchema.index({ hospitalId: 1, status: 1 });

module.exports = mongoose.model('EmergencyAlert', alertSchema);
