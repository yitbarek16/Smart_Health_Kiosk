const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  kioskId: { type: String, required: true },
  vitals: {
    systolicBP: { type: Number, default: null },
    diastolicBP: { type: Number, default: null },
    heartRate: { type: Number, default: null },
    spo2: { type: Number, default: null },
    temperatureCelsius: { type: Number, default: null },
    weightKg: { type: Number, default: null },
    heightCm: { type: Number, default: null },
    bmi: { type: Number, default: null },
    meanArterialPressure: { type: Number, default: null },
  },
  measuredAt: { type: Date, default: Date.now },
  syncStatus: {
    type: String,
    enum: ['buffered', 'synced'],
    default: 'synced',
  },
}, { timestamps: true });

measurementSchema.index({ patientId: 1, measuredAt: -1 });

module.exports = mongoose.model('Measurement', measurementSchema);
