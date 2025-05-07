const messageController = require("../controllers/messageController");
const authUser = require("../middlewares/authUser");
const messageRouter = require("express").Router();
const validator = require("../middlewares/validateMiddleware");
const uploadCloud = require("../config/cloudinary");
const { createMessageValidator } = require("../validator/messageValidatior");

module.exports = (io) => {
  messageRouter.use((req, res, next) => {
    req.io = io;
    next();
  });

  messageRouter.post(
    "/create",
    authUser,
    uploadCloud.single("attachment"),
    validator(createMessageValidator),
    messageController.createMessage
  );
  messageRouter.get(
    "/:conversationId/get-all",
    authUser,
    messageController.getAllMessage
  );

  return messageRouter;
};
