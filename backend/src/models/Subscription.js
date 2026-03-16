const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  paymentType: { type: String, default: 'annual_subscription' },
  receiptImageUrl: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending',
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', default: null },
  reviewedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: '' },
  expiresAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
