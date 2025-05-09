const { body } = require("express-validator");

const requestCreateOrder = [
  body("requirements").notEmpty().withMessage("requirements is required"),
];

const responseCreateOrder = [
  body("response")
    .notEmpty()
    .withMessage("response is required")
    .isIn(["approve", "reject"])
    .withMessage("response must be either 'accept' or 'reject'"),
];

const requestCancelOrder = [
  body("reason").notEmpty().withMessage("reason is required"),
];

const responseCancelOrder = [
  body("response")
    .notEmpty()
    .withMessage("response is required")
    .isIn(["approve", "reject"])
    .withMessage("response must be either 'approve' or 'reject'"),
];
module.exports = {
  requestCreateOrder,
  responseCreateOrder,
  requestCancelOrder,
  responseCancelOrder,
};
