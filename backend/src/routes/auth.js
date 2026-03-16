const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/patient/signup', ctrl.patientSignup);
router.post('/patient/login', ctrl.patientLogin);
router.post('/staff/login', ctrl.staffLogin);
router.get('/me', authenticate, ctrl.getMe);

module.exports = router;
