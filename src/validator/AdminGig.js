const { body } = require("express-validator");

const responseCreate = [
  body("status")
    .notEmpty()
    .withMessage("status is required")
    .isIn(["approved", "rejected"])
    .withMessage("status must be either 'accepetd' or 'rejected'"),
];

module.exports = { responseCreate };
