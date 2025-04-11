const conversationController = require("../controllers/ConversationController");
const conversationRouter = require("express").Router();
const authUser = require("../middlewares/authUser");
const {
  createConversationValidator,
} = require("../validator/conversationValidator");
const validator = require("../middlewares/validateMiddleware");
conversationRouter.post(
  "/create-or-get",
  authUser,
  validator(createConversationValidator),
  conversationController.createOrGetConversation
);
conversationRouter.get(
  "/get-coversation",
  authUser,
  conversationController.getAllConversation
);

module.exports = conversationRouter;
