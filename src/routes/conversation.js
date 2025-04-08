const conversationController = require("../controllers/ConversationController");
const conversationRouter = require("express").Router();
const userMiddleware = require("../middlewares/userMiddleware");

conversationRouter.post(
  "/create-or-get",
  userMiddleware,
  conversationController.createOrGetConversation
);
conversationRouter.get(
  "/get-coversation",
  userMiddleware,
  conversationController.getAllConversation
);

module.exports = conversationRouter;
