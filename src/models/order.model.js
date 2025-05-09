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
    media: [
      {
        type: { type: String },
        url: String,
        _id: mongoose.Schema.Types.ObjectId,
      },
    ],
    requirements: {
      type: String,
      // required: true, // Bắt buộc customer phải gửi yêu cầu
    },
    status: {
      type: String,
      enum: ["pending", "approved", "completed", "canceled", "rejected"],
      default: "pending",
    },
    cancelRequestId: {
      type: mongoose.Types.ObjectId,
      ref: "CancelRequest",
    },
    price: {
      type: mongoose.Types.Decimal128,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
