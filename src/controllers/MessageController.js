const { messageModel, conversationModel } = require("../models");
const { CustomException, catchAsync } = require("../utils");
const createMessage = catchAsync(async (req, res) => {
  const { conversationId, content } = req.body;
  const io = req.io;
  const conversation = await conversationModel.findById(conversationId);
  if (!conversation) {
    throw new CustomException("Conversation does not exist", 404);
  }

  const isParticipant =
    req.user._id.equals(conversation.customerId) ||
    req.user._id.equals(conversation.freelancerId);

  if (!isParticipant) {
    throw new CustomException(
      "Unauthorized: You are not part of this conversation",
      403
    );
  }

  const messageData = {
    conversationId,
    userId: req.user._id,
  };
  if (content) {
    messageData.content = content;
  }

  if (req.file) {
    messageData.attachment = {
      url: req.file.path,
      name: Buffer.from(req.file.originalname, "latin1").toString(),
      type: req.file.mimetype,
      size: req.file.size,
    };
  }
  const newMessage = await messageModel.create(messageData);

  conversation.lastMessage =
    content || (req.file.mimetype.includes("image") ? "📷 ảnh" : "📎file");
  conversation.lastMessageSender = req.user._id;
  conversation.readBySeller = req.user._id.equals(conversation.freelancerId);
  conversation.readByBuyer = req.user._id.equals(conversation.customerId);
  await conversation.save();
  // Broadcast message to conversation room via Socket.IO
  io.to(conversationId).emit("receive_message", {
    _id: newMessage._id,
    conversationId,
    userId: newMessage.userId,
    content: newMessage.content,
    lastMessage: conversation.lastMessage,
    attachment: newMessage.attachment,
    createdAt: newMessage.createdAt,
  });

  return res.status(201).json({
    error: false,
    message: "Message created successfully",
    message: {
      _id: newMessage._id,
      userId: newMessage.userId,
      content: newMessage.content,
      attachment: newMessage.attachment,
      createdAt: newMessage.createdAt,
    },
  });
});

const getAllMessage = catchAsync(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await conversationModel.findById(conversationId);
  if (!conversation) {
    throw new CustomException("Conversation does not exist", 404);
  }

  const isParticipant =
    req.user._id.equals(conversation.customerId) ||
    req.user._id.equals(conversation.freelancerId);

  if (!isParticipant) {
    throw new CustomException(
      "Unauthorized: You are not part of this conversation",
      403
    );
  }

  const messages = await messageModel
    .find({ conversationId })
    .select("_id conversationId userId content attachment createdAt")
    .sort({ created_at: 1 });

  if (req.user._id.equals(conversation.customerId)) {
    conversation.readByBuyer = true;
  } else if (req.user._id.equals(conversation.freelancerId)) {
    conversation.readBySeller = true;
  }
  await conversation.save();

  return res.status(200).json({
    error: false,
    message: "Messages retrieved successfully",
    messages,
  });
});

module.exports = { createMessage, getAllMessage };
