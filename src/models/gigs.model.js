const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  type: { type: String, enum: ["image", "video"], required: true },
  url: { type: String, required: true },
});

const gigSchema = new mongoose.Schema(
  {
    freelancerId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    keywords: {
      type: [String],
      // required: true,
    },
    price: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    media: [mediaSchema],
    duration: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "hidden"],
      default: "pending",
    },
    isDeleted: { type: Boolean, default: false },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    views: { type: Number, default: 0 },
    ordersCompleted: { type: Number, default: 0 },
    isHot: { type: Boolean, default: false },
    star: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejected_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejected_at: { type: Date, default: null },
    approved_at: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);
gigSchema.index(
  { title: "text", description: "text", keywords: "text" },
  {
    weights: {
      title: 2,
      description: 1,
      keywords: 1,
    },
  }
);
module.exports = mongoose.model("Gig", gigSchema);
