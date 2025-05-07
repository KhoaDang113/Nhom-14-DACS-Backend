const { body } = require("express-validator");

const createMessageValidator = [
  body("conversationId").notEmpty().withMessage("Conversation ID is required"),
  body("content").optional().isString().withMessage("Content must be a string"),

  body("attachment")
    .optional()
    .isString()
    .withMessage("Attachment must be a string")
    .isURL()
    .withMessage("Attachment must be a URL"),

  body().custom((_, { req }) => {
    if (!req.body.content && !req.file) {
      throw new Error("Either content or attachment is required");
    }
    return true;
  }),
];

const getAllMessageValidator = [
  body("conversationId").notEmpty().withMessage("Conversation ID is required"),
];

module.exports = {
  createMessageValidator,
  getAllMessageValidator,
};
