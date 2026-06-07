const router = require('express').Router();
const c = require('../controllers/bloodRequestController');
const { auth } = require('../middleware/auth');

router.post('/', auth, c.createRequest);
router.get('/mine', auth, c.getMyRequests);
router.get('/incoming', auth, c.getIncomingRequests);
router.put('/:id/respond', auth, c.respondToRequest);
router.put('/:id/cancel', auth, c.cancelRequest);

module.exports = router;
