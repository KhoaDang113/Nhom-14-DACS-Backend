const mongoose = require("mongoose");
const { body, param } = require("express-validator");
const { reviewModel } = require("../models");

const createReviewVote = [
  body("idReview")
    .notEmpty()
    .withMessage("idReview is required")
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid idReview ID");
      }
      const reviewExists = await reviewModel.findById(value);
      if (!reviewExists) {
        throw new Error("idReview does not exist");
      }
      return true;
    }),
  body("isHelpFull")
    .optional()
    .isIn(["like", "dislike", "none"])
    .withMessage("isHelpFull must like, dislike or none"),
];

module.exports = { createReviewVote };
