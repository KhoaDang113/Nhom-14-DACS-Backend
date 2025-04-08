const mongoose = require("mongoose");
const GigPackageSchema = new mongoose.Schema(
  {
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },
    name: {
      type: String,
      enum: ["Basic", "Standard", "Premium"],
      required: true,
    },
    price: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    revisions: {
      type: Number,
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GigPackage", GigPackageSchema);
