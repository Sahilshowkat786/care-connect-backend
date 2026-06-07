const EmergencyAlert = require('../models/EmergencyAlert');
const Hospital = require('../models/Hospital');
const { success, error } = require('../utils/response');

exports.submitAlert = async (req, res) => {
  try {
    const { patientName, patientAge, patientGender, condition, bloodGroup, allergies, hospitalId } = req.body;
    if (!patientName || !patientAge || !patientGender || !condition || !hospitalId) return error(res, 'Required fields missing.');
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return error(res, 'Hospital not found.', 404);
    const alert = new EmergencyAlert({ patientName, patientAge, patientGender, condition, bloodGroup: bloodGroup||'', allergies: allergies||'', hospitalId, submittedBy: req.user.userId });
    await alert.save();
    const populated = await alert.populate([{ path: 'hospitalId', select: 'name city' }, { path: 'submittedBy', select: 'name phone' }]);
    return success(res, { alert: populated }, 'Emergency alert submitted successfully.', 201);
  } catch (err) { return error(res, err.message, 500); }
};

exports.getHospitalAlerts = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ adminUserId: req.user.userId });
    if (!hospital) return error(res, 'No hospital found for this admin.', 404);
    const { status, page = 1, limit = 20 } = req.query;
    const query = { hospitalId: hospital._id };
    if (status) query.status = status;
    const skip = (page - 1) * limit;
    const [alerts, total] = await Promise.all([
      EmergencyAlert.find(query).populate('submittedBy', 'name phone').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      EmergencyAlert.countDocuments(query)
    ]);
    return success(res, { alerts, total });
  } catch (err) { return error(res, err.message, 500); }
};

exports.getAlertById = async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.id).populate([{ path: 'hospitalId', select: 'name city address phone' }, { path: 'submittedBy', select: 'name phone' }]);
    if (!alert) return error(res, 'Alert not found.', 404);
    return success(res, { alert });
  } catch (err) { return error(res, err.message, 500); }
};

exports.updateAlertStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['received', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) return error(res, 'Invalid status.');
    const hospital = await Hospital.findOne({ adminUserId: req.user.userId });
    if (!hospital) return error(res, 'Not authorized.', 403);
    const alert = await EmergencyAlert.findOne({ _id: req.params.id, hospitalId: hospital._id });
    if (!alert) return error(res, 'Alert not found.', 404);
    alert.status = status;
    if (status === 'received' && !alert.acknowledgedAt) alert.acknowledgedAt = new Date();
    await alert.save();
    return success(res, { alert }, 'Status updated.');
  } catch (err) { return error(res, err.message, 500); }
};

exports.getMyAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ submittedBy: req.user.userId }).populate('hospitalId', 'name city').sort({ createdAt: -1 });
    return success(res, { alerts });
  } catch (err) { return error(res, err.message, 500); }
};
