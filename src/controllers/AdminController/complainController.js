const { complaintModel } = require("../../models");
const { CustomException, catchAsync } = require("../../utils");

const getAllComplaints = catchAsync(async (req, res) => {
  const complaints = await complaintModel
    .find()
    .populate("gigId", "title")
    .populate("userId", "name email")
    .select("_id gigId userId description status resolvedAt createdAt")
    .lean();
  if (!complaints) {
    throw new CustomException("Complaint not found. you are free", 404);
  }

  res.status(200).json({
    error: false,
    message: "List of complaints",
    complaints,
  });
});

const getComplaintDetail = catchAsync(async (req, res) => {
  const complaint = await complaintModel
    .findById(req.params.idComplaint)
    .populate("gigId", "title")
    .populate("userId", "name email")
    .select("_id gigId userId description status resolvedAt createdAt")
    .lean();

  if (!complaint) {
    throw new CustomException("Complaint not found.", 404);
  }

  res.status(200).json({
    error: false,
    message: "Complaint details",
    complaint,
  });
});

const handleComplaint = catchAsync(async (req, res) => {
  const { status } = req.body;

  const complaint = await complaintModel.findById(req.params.idComplaint);
  if (!complaint) {
    throw new CustomException("Complaint not found.", 404);
  }

  complaint.status = status;
  complaint.resolvedAt = new Date();
  await complaint.save();

  res.status(200).json({
    error: false,
    message: "Complaint processed successfully",
    complaint: {
      _id: complaint._id,
      status: complaint.status,
      resolvedAt: complaint.resolvedAt,
    },
  });
});

module.exports = {
  getAllComplaints,
  getComplaintDetail,
  handleComplaint,
};
