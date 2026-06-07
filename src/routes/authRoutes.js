const router = require('express').Router();
const { register, login, refreshToken, logout, updatePushToken } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', auth, logout);
router.put('/push-token', auth, updatePushToken);

module.exports = router;
