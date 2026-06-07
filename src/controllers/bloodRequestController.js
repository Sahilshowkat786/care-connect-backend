const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const { success, error } = require('../utils/response');

exports.createRequest = async (req, res) => {
  try {
    const { bloodGroup, city, urgency } = req.body;
    if (!bloodGroup || !city) return error(res, 'Blood group and city are required.');
    // Matching algorithm
    const donors = await Donor.find({ bloodGroup, city: new RegExp(city, 'i'), isAvailable: true }).sort({ lastDonated: 1 }).limit(10);
    const matchedDonors = donors.map(d => ({ donorId: d._id, response: 'pending' }));
    const request = new BloodRequest({ requestedBy: req.user.userId, bloodGroup, city, urgency: urgency || 'normal', matchedDonors, status: 'open' });
    await request.save();
    const msg = matchedDonors.length ? `Request created. ${matchedDonors.length} donor(s) notified.` : 'No available donors found. Request created and will be visible to donors.';
    return success(res, { request, matchedCount: matchedDonors.length }, msg, 201);
  } catch (err) { return error(res, err.message, 500); }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requestedBy: req.user.userId }).sort({ createdAt: -1 });
    return success(res, { requests });
  } catch (err) { return error(res, err.message, 500); }
};

exports.getIncomingRequests = async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.userId });
    if (!donor) return error(res, 'Donor profile not found.', 404);
    const requests = await BloodRequest.find({ 'matchedDonors.donorId': donor._id, 'matchedDonors.response': 'pending', status: 'open' }).populate('requestedBy', 'name city').sort({ createdAt: -1 });
    return success(res, { requests });
  } catch (err) { return error(res, err.message, 500); }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { response } = req.body;
    if (!['accepted', 'declined'].includes(response)) return error(res, 'Invalid response.');
    const donor = await Donor.findOne({ userId: req.user.userId });
    if (!donor) return error(res, 'Donor profile not found.', 404);
    const request = await BloodRequest.findById(req.params.id);
    if (!request || request.status !== 'open') return error(res, 'Request not found or no longer open.', 404);
    const match = request.matchedDonors.find(d => d.donorId.toString() === donor._id.toString());
    if (!match) return error(res, 'You are not matched to this request.', 403);
    match.response = response;
    if (response === 'accepted') { request.status = 'fulfilled'; request.resolvedAt = new Date(); }
    await request.save();
    return success(res, { request }, `Response recorded: ${response}.`);
  } catch (err) { return error(res, err.message, 500); }
};

exports.cancelRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findOne({ _id: req.params.id, requestedBy: req.user.userId });
    if (!request) return error(res, 'Request not found.', 404);
    if (request.status !== 'open') return error(res, 'Only open requests can be cancelled.');
    request.status = 'cancelled';
    await request.save();
    return success(res, { request }, 'Request cancelled.');
  } catch (err) { return error(res, err.message, 500); }
};
