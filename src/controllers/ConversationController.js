const { conversationModel } = require("../models");
const { CustomException, catchAsync } = require("../utils");

const sanitizeConversation = (conv) => ({
  _id: conv._id,
  customerId: {
    _id: conv.customerId._id,
    fullName: conv.customerId.fullName,
  },
  freelancerId: {
    _id: conv.freelancerId._id,
    fullName: conv.freelancerId.fullName,
  },
  lastMessage: conv.lastMessage,
  readByBuyer: conv.readByBuyer,
  readBySeller: conv.readBySeller,
  updatedAt: conv.updatedAt,
});

const createOrGetConversation = catchAsync(async (req, res) => {
  const { to, from } = req.body;
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
    conversation: sanitizeConversation(conversation),
  });
});

const getAllConversation = catchAsync(async (req, res) => {
  const conversationList = await conversationModel
    .find({
      $or: [{ customerId: req.user._id }, { freelancerId: req.user._id }],
    })
    .populate("customerId", "fullName")
    .populate("freelancerId", "fullName")
    .sort({ updatedAt: -1 });
  return res.status(200).json({
    error: false,
    message: "Conversations retrieved successfully",
    conversationList: conversationList.map(sanitizeConversation),
  });
});

module.exports = {
  createOrGetConversation,
  getAllConversation,
};
