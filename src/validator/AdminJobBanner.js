const { body } = require("express-validator");

const createJobBannerValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 100 })
    .withMessage("Description must be less than 100 characters long"),
  // body("file").notEmpty().withMessage("image is required"),
  body("cta")
    .notEmpty()
    .withMessage("CTA is required")
    .isString()
    .withMessage("CTA must be a string"),
  body("ctaLink").notEmpty().withMessage("CTA link is required"),
];

module.exports = {
  createJobBannerValidator,
};
