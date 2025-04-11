const { body } = require("express-validator");

const createConversationValidator = [
  body("from").notEmpty().withMessage("From user ID is required"),
  body("to").notEmpty().withMessage("To user ID is required"),
];

module.exports = { createConversationValidator };
