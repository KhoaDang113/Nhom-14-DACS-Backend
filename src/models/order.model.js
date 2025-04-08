const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    gigId: {
      type: mongoose.Types.ObjectId,
      ref: "Gig",
      require: true,
    },
    customerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      require: true,
    },
    freelancerId: {
      type: String,
      require: true,
    },
    title: {
      type: String,
      require: true,
    },
    media: {
      type: [String],
      require: true,
    },
    requirements: {
      type: String,
      required: true, // Bắt buộc customer phải gửi yêu cầu
    },
    // attachments: {
    //   type: [String], // Lưu danh sách URL của file
    //   default: [],
    // },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "in_progress",
        "completed",
        "canceled",
        "rejected",
      ],
      default: "pending",
    },
    cancelRequestId: {
      type: mongoose.Types.ObjectId,
      ref: "CancelRequest",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
