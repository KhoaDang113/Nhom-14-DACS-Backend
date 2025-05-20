const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    receiverId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["review", "order", "complaint", "service", "message"], // Thêm type "message"
    },
    title: {
      // Thêm trường title
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sender: {
      id: { type: mongoose.Types.ObjectId, ref: "User", required: true },
      fullName: {
        type: String,
        required: true,
      },
    },
    conversationId: {
      ref: "Conversation",
      type: mongoose.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isNotification: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
