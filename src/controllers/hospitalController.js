const Hospital = require('../models/Hospital');
const { success, error } = require('../utils/response');

exports.getAllHospitals = async (req, res) => {
  try {
    const { city, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (city) query.city = new RegExp(city, 'i');
    if (search) query.$text = { $search: search };
    const skip = (page - 1) * limit;
    const [hospitals, total] = await Promise.all([
      Hospital.find(query).skip(skip).limit(Number(limit)).sort({ name: 1 }),
      Hospital.countDocuments(query)
    ]);
    return success(res, { hospitals, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { return error(res, err.message, 500); }
};

exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return error(res, 'Hospital not found.', 404);
    return success(res, { hospital });
  } catch (err) { return error(res, err.message, 500); }
};

exports.createHospital = async (req, res) => {
  try {
    const { name, address, city, phone, departments } = req.body;
    if (!name || !address || !city || !phone) return error(res, 'Name, address, city, phone are required.');
    const hospital = new Hospital({ name, address, city, phone, departments: departments || [], adminUserId: req.user.userId });
    await hospital.save();
    return success(res, { hospital }, 'Hospital created.', 201);
  } catch (err) { return error(res, err.message, 500); }
};

exports.updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ _id: req.params.id, adminUserId: req.user.userId });
    if (!hospital) return error(res, 'Hospital not found or unauthorized.', 404);
    const { name, address, phone, departments } = req.body;
    if (name) hospital.name = name;
    if (address) hospital.address = address;
    if (phone) hospital.phone = phone;
    if (departments) hospital.departments = departments;
    await hospital.save();
    return success(res, { hospital }, 'Hospital updated.');
  } catch (err) { return error(res, err.message, 500); }
};

exports.getMyHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ adminUserId: req.user.userId });
    if (!hospital) return error(res, 'No hospital found for this admin.', 404);
    return success(res, { hospital });
  } catch (err) { return error(res, err.message, 500); }
};
