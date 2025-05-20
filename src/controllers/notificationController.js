const { notificationModel, conversationModel } = require("../models");
const { CustomException, catchAsync } = require("../utils");

// GET /api/notifications
const getNotification = catchAsync(async (req, res) => {
  const notifications = await notificationModel
    .find({ receiverId: req.user._id })
    .populate("sender", "fullName")
    .select("-__v")
    .sort({ createdAt: -1 });
  return res.status(201).json({
    error: false,
    message: "notifications retrieved successfully",
    notifications,
  });
});

// POST /api/notifications
const createNotification = catchAsync(async (req, res) => {
  const { type, title, message, conversationId } = req.body;
  const conversation = await conversationModel.findById(conversationId);
  if (!conversation) {
    throw new CustomException("Conversation does not exist", 404);
  }
  const reciver = req.user._id.equals(conversation.customerId)
    ? conversation.freelancerId
    : conversation.customerId;

  const notification = await notificationModel.create({
    type,
    title,
    message,
    receiverId: reciver,
    sender: {
      id: req.user._id,
      fullName: req.user.name,
    },
    conversationId,
  });

  return res.status(201).json({
    error: false,
    message: "notification retrieved successfully",
    notification,
  });
});

const updateNotification = catchAsync(async (req, res) => {
  const { notificationId } = req.body;
  const notification = await notificationModel.findByIdAndUpdate(
    notificationId,
    { isRead: true, isNotification: true },
    { new: true }
  );
  return res.status(201).json({
    error: false,
    message: "notification retrieved successfully",
    notification,
  });
});

// PUT /api/notifications/:id/read
const readNotifications = catchAsync(async (req, res) => {
  const notification = await notificationModel.updateMany(
    { conversationId: req.params.id },
    { $set: { isRead: true, isNotification: true } }
  );
  return res.status(201).json({
    error: false,
    message: "notification retrieved successfully",
    notification,
  });
});

const updateAllNotifications = catchAsync(async (req, res) => {
  const { uerId } = req.params;
  const notification = await notificationModel.updateMany(
    { receiverId: uerId },
    { $set: { isNotification: true } }
  );
  return res.status(201).json({
    error: false,
    message: "notification retrieved successfully",
    notification,
  });
});

module.exports = {
  getNotification,
  createNotification,
  readNotifications,
  updateNotification,
  updateAllNotifications,
};
