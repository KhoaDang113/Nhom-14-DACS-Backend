const { conversationModel, userModel } = require("../models");
const { CustomException, catchAsync } = require("../utils");

const sanitizeConversation = (conv, userId) => {
  const isCustomer = conv.customerId._id.toString() === userId.toString();
  const isMe = userId.toString() === conv.lastMessageSender?.toString();
  return {
    _id: conv._id,
    user: {
      _id: isCustomer ? conv.freelancerId._id : conv.customerId._id,
      fullName: isCustomer ? conv.freelancerId.name : conv.customerId.name,
      avatar: isCustomer ? conv.freelancerId.avatar : conv.customerId.avatar,
    },
    lastMessage: conv.lastMessage,
    lastMessageSender: (isMe ? "Me: " : "") || "",
    readByBuyer: conv.readByBuyer,
    readBySeller: conv.readBySeller,
    updatedAt: conv.updatedAt,
  };
};

const createOrGetConversation = catchAsync(async (req, res) => {
  const { to, from } = req.body;
  const userTo = await userModel.findById(to);
  const userFrom = await userModel.findById(from);
  if (!userTo || !userFrom) {
    return;
  }
  if (req.user._id.toString() !== from && req.user._id.toString() !== to) {
    throw new CustomException(
      "You are not authorized to create a conversation",
      403
    );
  }
  if (req.user._id.toString() === from && req.user._id.toString() === to) {
    throw new CustomException(
      "You cannot create a conversation with yourself",
      400
    );
  }
  let conversation = await conversationModel.findOne({
    $or: [
      { customerId: from, freelancerId: to },
      { customerId: to, freelancerId: from },
    ],
  });

  if (conversation) {
    return res
      .status(200)
      .json({ message: "Conversation already exists", conversation });
  }
  conversation = await conversationModel.create({
    customerId: from,
    freelancerId: to,
    readBySeller: false,
    readByBuyer: false,
    lastMessage: "",
  });
  await conversation.save();
  return res.status(201).json({
    message: "Conversation created successfully",
    conversation: sanitizeConversation(conversation, req.user._id),
  });
});

const getAllConversation = catchAsync(async (req, res) => {
  const conversationList = await conversationModel
    .find({
      $or: [{ customerId: req.user._id }, { freelancerId: req.user._id }],
    })
    .populate("customerId", "name avatar")
    .populate("freelancerId", "name avatar")
    .sort({ updatedAt: -1 });
  const userId = req.user._id;
  return res.status(200).json({
    error: false,
    message: "Conversations retrieved successfully",
    conversationList: conversationList.map((conv) =>
      sanitizeConversation(conv, userId)
    ),
  });
});

const getConversationById = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const conversation = await conversationModel
    .findById(conversationId)
    .populate("customerId", "name avatar")
    .populate("freelancerId", "name avatar");
  if (!conversation) {
    throw new CustomException("Conversation not found", 404);
  }
  return res.status(200).json({
    error: false,
    message: "Conversation retrieved successfully",
    conversation: sanitizeConversation(conversation, req.user._id),
  });
});

module.exports = {
  createOrGetConversation,
  getAllConversation,
  getConversationById,
};
