const notificationRouter = require("express").Router();
const notificationController = require("../controllers/notificationController");
const authUser = require("../middlewares/authUser");
notificationRouter.get("/", authUser, notificationController.getNotification);
notificationRouter.post(
  "/",
  authUser,
  notificationController.createNotification
);
notificationRouter.put("/:id/read", notificationController.readNotifications);
notificationRouter.put(
  "/update-read",
  authUser,
  notificationController.updateNotification
);
notificationRouter.post(
  "/update-notification/:uerId",
  notificationController.updateAllNotifications
);

module.exports = notificationRouter;
