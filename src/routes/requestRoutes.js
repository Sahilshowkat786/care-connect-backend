const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const auth = require('../middleware/auth');

router.post('/', auth, requestController.createRequest);
router.get('/mine', auth, requestController.getMyRequests);
router.get('/incoming', auth, requestController.getIncomingRequests);
router.put('/:id/respond', auth, requestController.respondToRequest);
router.put('/:id/cancel', auth, requestController.cancelRequest);

module.exports = router;
