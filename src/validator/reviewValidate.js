const { body } = require("express-validator");

const createReview = [
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),

  body("star")
    .notEmpty()
    .withMessage("Star rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Star rating must be between 1 and 5"),
];

module.exports = { createReview };
