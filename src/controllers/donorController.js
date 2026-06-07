const Donor = require('../models/Donor');
const { success, error } = require('../utils/response');

exports.registerDonor = async (req, res) => {
  try {
    const exists = await Donor.findOne({ userId: req.user.userId });
    if (exists) return error(res, 'Donor profile already exists.');
    const { bloodGroup, city, lastDonated } = req.body;
    if (!bloodGroup || !city) return error(res, 'Blood group and city are required.');
    const donor = new Donor({ userId: req.user.userId, bloodGroup, city, lastDonated: lastDonated || null });
    await donor.save();
    const populated = await donor.populate('userId', 'name phone email');
    return success(res, { donor: populated }, 'Donor registered successfully.', 201);
  } catch (err) { return error(res, err.message, 500); }
};

exports.getMyDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.userId }).populate('userId', 'name phone email city');
    if (!donor) return error(res, 'Donor profile not found.', 404);
    return success(res, { donor });
  } catch (err) { return error(res, err.message, 500); }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const donor = await Donor.findOneAndUpdate({ userId: req.user.userId }, { isAvailable }, { new: true });
    if (!donor) return error(res, 'Donor profile not found.', 404);
    return success(res, { donor }, `Availability set to ${isAvailable}.`);
  } catch (err) { return error(res, err.message, 500); }
};

exports.searchDonors = async (req, res) => {
  try {
    const { bloodGroup, city, page = 1, limit = 10 } = req.query;
    const query = { isAvailable: true };
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (city) query.city = new RegExp(city, 'i');
    const skip = (page - 1) * limit;
    const [donors, total] = await Promise.all([
      Donor.find(query).populate('userId', 'name phone city').skip(skip).limit(Number(limit)).sort({ lastDonated: 1 }),
      Donor.countDocuments(query)
    ]);
    return success(res, { donors, total });
  } catch (err) { return error(res, err.message, 500); }
};

exports.getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id).populate('userId', 'name city');
    if (!donor) return error(res, 'Donor not found.', 404);
    return success(res, { donor });
  } catch (err) { return error(res, err.message, 500); }
};
