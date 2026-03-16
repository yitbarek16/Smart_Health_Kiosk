const router = require('express').Router();
const ctrl = require('../controllers/subscriptionController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', authenticate, authorize('patient'), upload.single('receipt'), ctrl.createSubscription);
router.get('/mine', authenticate, authorize('patient'), ctrl.getMySubscription);
router.get('/pending', authenticate, authorize('super_admin'), ctrl.getPendingSubscriptions);
router.get('/', authenticate, authorize('super_admin'), ctrl.getAllSubscriptions);
router.patch('/:id/review', authenticate, authorize('super_admin'), ctrl.reviewSubscription);

module.exports = router;
