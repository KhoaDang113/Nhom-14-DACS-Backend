const { userModel, conversationModel, gigModel } = require("../models");

const createOrGetConversation = async (req, res) => {
  try {
    const { to, from } = req.body;

    const user = await userModel.findOne({ clerkId: req.UserID });
    if (user._id.toString() !== from && user._id.toString() !== to) {
      return res
        .status(403)
        .json({ message: "You are not authorized to create a conversation" });
    }
    if (user._id.toString() === from && user._id.toString() === to) {
      return res
        .status(400)
        .json({ message: "You cannot create a conversation with yourself" });
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
      conversation,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllConversation = async (req, res) => {
  try {
    const user = await userModel.findOne({ clerkId: req.UserID });
    const conversationList = await conversationModel
      .find({
        $or: [{ customerId: user._id }, { freelancerId: user._id }],
      })
      .populate("customerId", "fullName")
      .populate("freelancerId", "fullName")
      .sort({ updatedAt: -1 });
    return res.status(200).json({
      error: false,
      message: "Conversations retrieved successfully",
      conversationList,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

module.exports = {
  createOrGetConversation,
  getAllConversation,
};
