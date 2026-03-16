const mongoose = require('mongoose');

const patientHospitalAccessSchema = new mongoose.Schema({
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
  grantedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['active', 'revoked'],
    default: 'active',
  },
}, { timestamps: true });

patientHospitalAccessSchema.index({ hospitalId: 1, status: 1 });
patientHospitalAccessSchema.index({ patientId: 1, hospitalId: 1 });

module.exports = mongoose.model('PatientHospitalAccess', patientHospitalAccessSchema);
