const router = require('express').Router();
const ctrl = require('../controllers/measurementController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('patient'), ctrl.createMeasurement);
router.post('/analyze', authenticate, authorize('patient'), ctrl.analyzeAndSuggest);
router.get('/mine', authenticate, authorize('patient'), ctrl.getMyMeasurements);
router.get('/patient/:patientId', authenticate, authorize('provider'), ctrl.getPatientMeasurements);

module.exports = router;
