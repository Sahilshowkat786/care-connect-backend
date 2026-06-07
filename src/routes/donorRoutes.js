const router = require('express').Router();
const c = require('../controllers/donorController');
const { auth } = require('../middleware/auth');

router.post('/register', auth, c.registerDonor);
router.get('/me', auth, c.getMyDonorProfile);
router.put('/availability', auth, c.updateAvailability);
router.get('/search', auth, c.searchDonors);
router.get('/:id', auth, c.getDonorById);

module.exports = router;
