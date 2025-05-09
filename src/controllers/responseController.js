// controllers/respone.controller.js
const { reviewModel, responseModel, gigModel } = require("../models");
const { CustomException, catchAsync } = require("../utils");

const createRespone = catchAsync(async (req, res) => {
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

  const respone = await responseModel.create({
    reviewId: idReview,
    freelancerId: req.user._id,
    description: description,
    like: like || false,
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
  const respone = await responseModel.findById(idReview);
  if (!respone) throw new CustomException("Response not found", 404);
  return res.status(200).json({
    error: false,
    message: "Get response successfully",
    respone: {
      id: respone._id,
      reviewId: idReview,
      description: respone.description,
      freelancerId: respone.freelancerId,
      like: respone.like,
      createdAt: respone.createdAt,
    },
  });
});
module.exports = { createRespone, getRespone };
