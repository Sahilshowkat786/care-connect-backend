const router = require('express').Router();
const c = require('../controllers/alertController');
const { auth, allowRoles } = require('../middleware/auth');

router.post('/', auth, c.submitAlert);
router.get('/hospital', auth, allowRoles('hospital_admin'), c.getHospitalAlerts);
router.get('/mine', auth, c.getMyAlerts);
router.get('/:id', auth, c.getAlertById);
router.put('/:id/status', auth, allowRoles('hospital_admin'), c.updateAlertStatus);

module.exports = router;
