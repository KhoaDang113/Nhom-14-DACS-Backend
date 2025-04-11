const messageController = require("../controllers/MessageController");
const authUser = require("../middlewares/authUser");
const messageRouter = require("express").Router();
const validator = require("../middlewares/validateMiddleware");
const {
  createMessageValidator,
  getAllMessageValidator,
} = require("../validator/messageValidatior");
messageRouter.post(
  "/create",
  authUser,
  validator(createMessageValidator),
  messageController.createMessage
);
messageRouter.get(
  "/get-all",
  authUser,
  validator(getAllMessageValidator),
  messageController.getAllMessage
);

module.exports = messageRouter;
