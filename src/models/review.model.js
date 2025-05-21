const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
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
    title: {
      type: String,
      default: "",
    },
    star: {
      type: Number,
      require: true,
      max: 5,
    },
    description: {
      type: String,
      require: true,
    },
    priceRange: {
      type: String,
      require: true,
    },
    duration: {
      type: String,
      require: true,
    },
    orderId: {
      type: mongoose.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    isResponse: {
      type: mongoose.Types.ObjectId,
      ref: "Response",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);
