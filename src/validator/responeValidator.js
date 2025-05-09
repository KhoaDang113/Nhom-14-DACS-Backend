const mongoose = require("mongoose");
const { body, param } = require("express-validator");
const { reviewModel } = require("../models");

const createRespone = [
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
  ,
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),

  body("like")
    .optional()
    .isBoolean()
    .withMessage("Like must be a boolean value"),
];

const getRespone = [
  param("idReview")
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
];

module.exports = { createRespone, getRespone };
