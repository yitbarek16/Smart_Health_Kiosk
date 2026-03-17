const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  measurementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Measurement',
    required: true,
  },
  aiInsightId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIInsight',
    default: null,
  },
  receiptImageUrl: { type: String, required: true },
  bookingFee: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  conditionLabel: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', default: null },
  reviewedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: '' },
  appointmentDate: { type: Date, default: null },
}, { timestamps: true });

appointmentSchema.index({ hospitalId: 1, status: 1 });
appointmentSchema.index({ patientId: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
