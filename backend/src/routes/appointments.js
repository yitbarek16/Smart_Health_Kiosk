const router = require('express').Router();
const ctrl = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', authenticate, authorize('patient'), upload.single('receipt'), ctrl.createAppointment);
router.get('/mine', authenticate, authorize('patient'), ctrl.getMyAppointments);
router.get('/hospital', authenticate, authorize('provider'), ctrl.getHospitalAppointments);
router.patch('/:id/review', authenticate, authorize('provider'), ctrl.reviewAppointment);
router.get('/hospital/patients', authenticate, authorize('provider'), ctrl.getHospitalPatients);

module.exports = router;
