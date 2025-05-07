const conversationController = require("../controllers/conversationController");
const conversationRouter = require("express").Router();
const authUser = require("../middlewares/authUser");
const {
  createConversationValidator,
} = require("../validator/conversationValidator");
const validate = require("../middlewares/validateMiddleware");
conversationRouter.post(
  "/create-or-get",
  authUser,
  validate(createConversationValidator),
  conversationController.createOrGetConversation
);
conversationRouter.get(
  "/get-conversations",
  authUser,
  conversationController.getAllConversation
);
conversationRouter.get(
  "/get-conversation/:conversationId",
  authUser,
  conversationController.getConversationById
);

module.exports = conversationRouter;
