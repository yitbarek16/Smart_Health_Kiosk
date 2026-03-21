const { Hospital, Kiosk, UserAccount, Patient, Subscription, Measurement } = require('../models');

exports.createHospital = async (req, res) => {
  try {
    const { name, latitude, longitude, address, phone, specializations, bookingFee, googlePlaceId } = req.body;
    const hospital = await Hospital.create({
      name,
      location: { type: 'Point', coordinates: [longitude, latitude] },
      address: address || '',
      phone: phone || '',
      specializations: specializations || [],
      bookingFee: bookingFee || 0,
      googlePlaceId: googlePlaceId || null,
    });
    res.status(201).json({ hospital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.latitude != null && updates.longitude != null) {
      updates.location = {
        type: 'Point',
        coordinates: [updates.longitude, updates.latitude],
      };
      delete updates.latitude;
      delete updates.longitude;
    }
    const hospital = await Hospital.findByIdAndUpdate(id, updates, { new: true });
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    res.json({ hospital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getHospitals = async (_req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ name: 1 });
    res.json({ hospitals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createKiosk = async (req, res) => {
  try {
    const { kioskId, wifiSsid, latitude, longitude, address, firmwareVersion } = req.body;
    const kiosk = await Kiosk.create({
      kioskId,
      wifiSsid,
      location: { type: 'Point', coordinates: [longitude || 0, latitude || 0] },
      address: address || '',
      firmwareVersion: firmwareVersion || '1.0.0',
    });
    res.status(201).json({ kiosk });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateKiosk = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.latitude != null && updates.longitude != null) {
      updates.location = {
        type: 'Point',
        coordinates: [updates.longitude, updates.latitude],
      };
      delete updates.latitude;
      delete updates.longitude;
    }
    const kiosk = await Kiosk.findByIdAndUpdate(id, updates, { new: true });
    if (!kiosk) return res.status(404).json({ error: 'Kiosk not found' });
    res.json({ kiosk });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getKiosks = async (_req, res) => {
  try {
    const kiosks = await Kiosk.find().sort({ kioskId: 1 });
    res.json({ kiosks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStaffAccount = async (req, res) => {
  try {
    const { username, password, role, name, hospitalId } = req.body;
    if (!['provider', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be provider or super_admin' });
    }
    const user = await UserAccount.create({
      username, password, role, name,
      hospitalId: hospitalId || null,
    });
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStaffAccounts = async (_req, res) => {
  try {
    const users = await UserAccount.find()
      .populate('hospitalId', 'name')
      .sort({ role: 1, name: 1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDashboardStats = async (_req, res) => {
  try {
    const [totalPatients, activeSubscriptions, totalKiosks, onlineKiosks, totalMeasurements, totalHospitals] =
      await Promise.all([
        Patient.countDocuments(),
        Subscription.countDocuments({ status: 'approved' }),
        Kiosk.countDocuments(),
        Kiosk.countDocuments({ status: 'online' }),
        Measurement.countDocuments(),
        Hospital.countDocuments({ isActive: true }),
      ]);

    res.json({
      stats: {
        totalPatients,
        activeSubscriptions,
        totalKiosks,
        onlineKiosks,
        totalMeasurements,
        totalHospitals,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
