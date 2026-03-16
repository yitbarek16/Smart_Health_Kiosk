const mongoose = require('mongoose');

const kioskSchema = new mongoose.Schema({
  kioskId: { type: String, required: true, unique: true },
  wifiSsid: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  address: { type: String, default: '' },
  status: {
    type: String,
    enum: ['online', 'offline', 'maintenance'],
    default: 'offline',
  },
  firmwareVersion: { type: String, default: '1.0.0' },
  lastHeartbeat: { type: Date, default: null },
  lastSyncTime: { type: Date, default: null },
}, { timestamps: true });

kioskSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Kiosk', kioskSchema);
