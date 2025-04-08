const { messageModel, userModel, conversationModel } = require("../models");
const { CustomException } = require("../utils");

const createMessage = async (req, res) => {
  try {
    const user = await userModel.findOne({ clerkId: req.UserID });

    const { conversationId, content } = req.body;

    const conversation = await conversationModel.findById(conversationId);
    if (!conversation) {
      throw CustomException("Conversation is not exists", 404);
    }
    if (
      user._id.toString() !== conversation.customerId.toString() &&
      user._id.toString() !== conversation.freelancerId.toString()
    ) {
      throw CustomException(
        "Unauthorized: You are not part of this conversation",
        403
      );
    }

    const messageData = {
      conversationId: conversationId,
      userId: user._id,
      content: content,
    };
    const Newmessage = new messageModel(messageData);
    await Newmessage.save();
    conversation.lastMessage = content;
    conversation.readBySeller =
      user._id.toString() === conversation.freelancerId.toString();
    conversation.readByBuyer =
      user._id.toString() === conversation.customerId.toString();
    await conversation.save();
    return res.status(201).json({
      error: true,
      message: "Create message successfully",
      Newmessage,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

const getAllMessage = async (req, res) => {
  try {
    const user = await userModel.findOne({ clerkId: req.UserID });
    const { conversationId } = req.body;
    const conversation = await conversationModel.findById(conversationId);
    if (!conversation) {
      throw CustomException("Conversation is not exists", 404);
    }
    if (
      user._id.toString() !== conversation.customerId.toString() &&
      user._id.toString() !== conversation.freelancerId.toString()
    ) {
      throw CustomException(
        "Unauthorized: You are not part of this conversation",
        403
      );
    }
    const messages = await messageModel
      .find({ conversationId })
      .populate({ path: "userId", select: "fullName" })
      .sort({ created_at: 1 });

    if (user._id.toString() === conversation.customerId.toString()) {
      conversation.readByBuyer = true;
    } else if (user._id.toString() === conversation.freelancerId.toString()) {
      conversation.readBySeller = true;
    }
    await conversation.save();

    return res.status(200).json({
      error: false,
      message: "Messages retrieved successfully",
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
module.exports = { createMessage, getAllMessage };
