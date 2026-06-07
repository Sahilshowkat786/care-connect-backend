const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const { success, error } = require('../utils/response');

exports.createRequest = async (req, res) => {
  try {
    const { bloodGroup, city, urgency } = req.body;
    // Matching algorithm - find available donors sorted by last donation
    const donors = await Donor.find({ bloodGroup, city: new RegExp(city, 'i'), isAvailable: true })
      .sort({ lastDonated: 1 }).limit(10);
    const matchedDonors = donors.map(d => ({ donorId: d._id, response: 'pending' }));
    const request = await BloodRequest.create({ requestedBy: req.user.userId, bloodGroup, city, urgency, matchedDonors });
    // In production: FCM push to each matched donor
    donors.forEach(d => console.log(`[FCM] Would notify donor ${d._id}`));
    const msg = matchedDonors.length === 0
      ? 'No available donors found in your city. Request created — donors will be notified when available.'
      : `Blood request created. ${matchedDonors.length} donors notified.`;
    return success(res, request, msg, 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requestedBy: req.user.userId }).sort({ createdAt: -1 });
    return success(res, requests);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getIncomingRequests = async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.userId });
    if (!donor) return error(res, 'Donor profile not found', 404);
    const requests = await BloodRequest.find({
      'matchedDonors.donorId': donor._id,
      'matchedDonors.response': 'pending',
      status: 'open'
    }).sort({ createdAt: -1 }).populate('requestedBy', 'name city phone');
    return success(res, requests);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { response } = req.body;
    const donor = await Donor.findOne({ userId: req.user.userId });
    if (!donor) return error(res, 'Donor profile not found', 404);
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return error(res, 'Request not found', 404);
    if (request.status !== 'open') return error(res, 'Request is no longer open', 400);
    const donorEntry = request.matchedDonors.find(d => d.donorId.toString() === donor._id.toString());
    if (!donorEntry) return error(res, 'You are not matched to this request', 403);
    donorEntry.response = response;
    if (response === 'accepted') {
      request.status = 'fulfilled';
      request.resolvedAt = new Date();
    }
    await request.save();
    return success(res, request, `Request ${response}`);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return error(res, 'Request not found', 404);
    if (request.requestedBy.toString() !== req.user.userId) return error(res, 'Forbidden', 403);
    if (request.status !== 'open') return error(res, 'Cannot cancel a non-open request', 400);
    request.status = 'cancelled';
    await request.save();
    return success(res, request, 'Request cancelled');
  } catch (err) {
    return error(res, err.message, 500);
  }
};
