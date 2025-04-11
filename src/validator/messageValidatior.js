const { body } = require("express-validator");

const createMessageValidator = [
  body("conversationId").notEmpty().withMessage("Conversation ID is required"),
  body("content").notEmpty().withMessage("content is required"),
];

const getAllMessageValidator = [
  body("conversationId").notEmpty().withMessage("Conversation ID is required"),
];
module.exports = {
  createMessageValidator,
  getAllMessageValidator,
};
