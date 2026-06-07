const express = require('express');
const Joi = require('joi');
const router = express.Router();
const authController = require('../controllers/authController');
const hospitalController = require('../controllers/hospitalController');
const alertController = require('../controllers/alertController');
const donorController = require('../controllers/donorController');
const requestController = require('../controllers/requestController');
const { auth, allowRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');

// ── Validation Schemas ──────────────────────────────────────────
const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('patient', 'donor', 'hospital_admin').required(),
  phone: Joi.string().min(7).required(),
  city: Joi.string().required(),
  bloodGroup: Joi.string().valid('A+','A-','B+','B-','AB+','AB-','O+','O-','').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ── Auth Routes ─────────────────────────────────────────────────
router.post('/auth/register', validate(registerSchema), authController.register);
router.post('/auth/login', validate(loginSchema), authController.login);
router.post('/auth/refresh', authController.refreshToken);
router.post('/auth/logout', auth, authController.logout);
router.put('/users/push-token', auth, authController.updatePushToken);

// ── Hospital Routes ─────────────────────────────────────────────
router.get('/hospitals', hospitalController.getAllHospitals);
router.get('/hospitals/mine', auth, allowRoles('hospital_admin'), hospitalController.getMyHospital);
router.get('/hospitals/:id', hospitalController.getHospitalById);
router.post('/hospitals', auth, allowRoles('hospital_admin'), hospitalController.createHospital);
router.put('/hospitals/:id', auth, allowRoles('hospital_admin'), hospitalController.updateHospital);

// ── Emergency Alert Routes ──────────────────────────────────────
router.post('/alerts', auth, alertController.submitAlert);
router.get('/alerts/hospital', auth, allowRoles('hospital_admin'), alertController.getHospitalAlerts);
router.get('/alerts/mine', auth, alertController.getMyAlerts);
router.get('/alerts/:id', auth, alertController.getAlertById);
router.put('/alerts/:id/status', auth, allowRoles('hospital_admin'), alertController.updateAlertStatus);

// ── Donor Routes ────────────────────────────────────────────────
router.post('/donors/register', auth, donorController.registerDonor);
router.get('/donors/me', auth, donorController.getMyDonorProfile);
router.put('/donors/availability', auth, donorController.updateAvailability);
router.get('/donors/search', auth, donorController.searchDonors);
router.get('/donors/:id', auth, donorController.getDonorById);

// ── Blood Request Routes ────────────────────────────────────────
router.post('/requests', auth, requestController.createRequest);
router.get('/requests/mine', auth, requestController.getMyRequests);
router.get('/requests/incoming', auth, requestController.getIncomingRequests);
router.put('/requests/:id/respond', auth, requestController.respondToRequest);
router.put('/requests/:id/cancel', auth, requestController.cancelRequest);

module.exports = router;
