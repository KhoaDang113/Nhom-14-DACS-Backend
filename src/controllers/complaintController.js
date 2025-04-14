const { complaintModel } = require("../models");
const { CustomException, catchAsync } = require("../utils");

const createComplaint = catchAsync(async (req, res) => {
  const { idGig } = req.params;
  const { reason, description } = req.body;
  const existsComplaint = await complaintModel.findOne({
    gigId: idGig,
    userId: req.user._id,
    reason: reason,
  });
  if (existsComplaint)
    throw new CustomException(
      "You have already reported this service with identical content",
      400
    );
  const validReasons = [
    "dịch vụ bị cấm",
    "nội dung không phù hợp",
    "không nguyên bản",
    "vi phạm quyền sở hữu trí tuệ",
    "khác",
  ];
  if (!validReasons.includes(reason)) {
    throw new CustomException("Invalid reason", 400);
  }

  const complaint = await complaintModel.create({
    gigId: idGig,
    userId: req.user._id,
    reason,
    description,
  });

  res.status(201).json({
    error: false,
    message: "Complaint submitted successfully",
    complaintId: complaint._id,
  });
});

module.exports = { createComplaint };
