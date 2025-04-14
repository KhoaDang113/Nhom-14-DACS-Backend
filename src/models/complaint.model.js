const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    gigId: {
      type: mongoose.Types.ObjectId,
      ref: "Gig",
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "dịch vụ bị cấm",
        "nội dung không phù hợp",
        "không nguyên bản",
        "vi phạm quyền sở hữu trí tuệ",
        "khác",
      ],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "rejected"],
      default: "pending",
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);
