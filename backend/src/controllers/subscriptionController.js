const { Subscription, Patient } = require('../models');
const { notifyPatient, notifySuperAdmin } = require('../services/socketService');

exports.createSubscription = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { amount, paymentMethod } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Receipt image is required' });
    }

    const pending = await Subscription.findOne({ patientId, status: 'pending' });
    if (pending) {
      return res.status(409).json({ error: 'You already have a pending subscription request' });
    }

    const subscription = await Subscription.create({
      patientId,
      receiptImageUrl: `/uploads/${req.file.filename}`,
      amount: Number(amount),
      paymentMethod,
    });

    notifySuperAdmin('new_subscription_request', {
      subscriptionId: subscription._id,
      patientId,
    });

    res.status(201).json({ subscription });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMySubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ patientId: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ subscription: sub });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingSubscriptions = async (_req, res) => {
  try {
    const subs = await Subscription.find({ status: 'pending' })
      .populate('patientId', 'name phone address')
      .sort({ createdAt: 1 });
    res.json({ subscriptions: subs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllSubscriptions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const subs = await Subscription.find(filter)
      .populate('patientId', 'name phone address')
      .sort({ createdAt: -1 });
    res.json({ subscriptions: subs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reviewSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be approve or reject' });
    }

    const sub = await Subscription.findById(id);
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    if (sub.status !== 'pending') {
      return res.status(400).json({ error: 'Subscription already reviewed' });
    }

    sub.status = action === 'approve' ? 'approved' : 'rejected';
    sub.reviewedBy = req.user.id;
    sub.reviewedAt = new Date();
    if (action === 'approve') {
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      sub.expiresAt = expiry;
    }
    if (action === 'reject') {
      sub.rejectionReason = rejectionReason || '';
    }
    await sub.save();

    if (action === 'approve') {
      await Patient.findByIdAndUpdate(sub.patientId, {
        subscriptionStatus: 'active',
        isVerified: true,
      });
    } else {
      await Patient.findByIdAndUpdate(sub.patientId, {
        subscriptionStatus: 'rejected',
      });
    }

    notifyPatient(sub.patientId.toString(), 'subscription_update', {
      status: sub.status,
      expiresAt: sub.expiresAt,
    });

    res.json({ subscription: sub });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
