const router = require('express').Router();
const c = require('../controllers/hospitalController');
const { auth, allowRoles } = require('../middleware/auth');

router.get('/', c.getAllHospitals);
router.get('/mine', auth, allowRoles('hospital_admin'), c.getMyHospital);
router.get('/:id', c.getHospitalById);
router.post('/', auth, allowRoles('hospital_admin'), c.createHospital);
router.put('/:id', auth, allowRoles('hospital_admin'), c.updateHospital);

module.exports = router;
