const mongoose = require("mongoose");

const reviewVoteSchema = mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Types.ObjectId,
      ref: "Review",
      require: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      require: true,
    },
    isHelpFull: {
      type: String,
      enum: ["like", "dislike", "none"],
      default: "none",
    },
  },
  { timestamps: { createdAt: "created_at" } }
);
module.exports = mongoose.model("ReviewVote", reviewVoteSchema);
