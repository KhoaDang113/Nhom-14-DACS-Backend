const messageController = require("../controllers/MessageController");
const userMiddleware = require("../middlewares/userMiddleware");
const messageRouter = require("express").Router();

messageRouter.post("/create", userMiddleware, messageController.createMessage);
messageRouter.get("/get-all", userMiddleware, messageController.getAllMessage);

module.exports = messageRouter;
