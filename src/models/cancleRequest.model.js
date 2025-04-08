const mongoose = require("mongoose");

const cancelRequestSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["none", "pending", "approved", "rejected", "auto-cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CancelRequest", cancelRequestSchema);
