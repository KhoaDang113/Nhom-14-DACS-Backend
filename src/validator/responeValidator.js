const { body, param } = require("express-validator");

const createRespone = [
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

module.exports = { createRespone };
