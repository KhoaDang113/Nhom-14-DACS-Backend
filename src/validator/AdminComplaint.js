const { body } = require("express-validator");

const handleComplaint = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["resolved", "rejected"])
    .withMessage("Status must be either resolved, or rejected"),
];

module.exports = {
  handleComplaint,
};
