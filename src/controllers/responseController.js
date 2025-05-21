// controllers/respone.controller.js
const {
  reviewModel,
  responseModel,
  gigModel,
  userModel,
} = require("../models");
const { CustomException, catchAsync } = require("../utils");

const createRespone = catchAsync(async (req, res) => {
  const io = req.io;
  const { idReview, description, like } = req.body;
  const freelancerId = req.UserID;
  const review = await reviewModel.findById(idReview);
  if (!review) throw new CustomException("Review not found", 404);

  const gig = await gigModel.findById(review.gigId);
  if (!gig || gig.freelancerId !== freelancerId) {
    throw new CustomException(
      "You do not have permission to respond to this review",
      403
    );
  }
  const existed = await responseModel.findOne({ reviewId: idReview });
  if (existed) {
    throw new CustomException("You have already responded to this review", 400);
  }
  const freelancer = await userModel.findOne({ clerkId: freelancerId });
  const respone = await responseModel.create({
    reviewId: idReview,
    freelancer: {
      id: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar,
    },
    description: description,
    like: like || false,
  });
  io.emit("new_response", {
    reviewId: idReview,
    response: {
      id: respone._id,
      reviewId: idReview,
      description: respone.description,
      freelancer: {
        id: freelancer._id,
        name: freelancer.name,
        avatar: freelancer.avatar,
      },
    },
  });
  review.isResponse = true;
  await review.save();
  return res.status(200).json({
    error: false,
    message: "Response submitted successfully",
    respone: {
      id: respone._id,
      reviewId: idReview,
      description: respone.description,
      like: respone.like,
      createdAt: respone.createdAt,
    },
  });
});

const getRespone = catchAsync(async (req, res) => {
  const { idReview } = req.params;
  const respone = await responseModel.findOne({ reviewId: idReview });
  if (!respone) throw new CustomException("Response not found", 404);
  const freelancer = await userModel.findById(respone.freelancerId);
  return res.status(200).json({
    error: false,
    message: "Get response successfully",
    respone: {
      id: respone._id,
      reviewId: idReview,
      description: respone.description,
      freelancer: {
        id: respone.freelancerId,
        name: freelancer.name,
        avatar: freelancer.avatar,
      },
      like: respone.like,
      createdAt: respone.createdAt,
    },
  });
});
module.exports = { createRespone, getRespone };
