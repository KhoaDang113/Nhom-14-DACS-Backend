// controllers/respone.controller.js
const { reviewModel, responeModel, gigModel } = require("../models");
const { CustomException, catchAsync } = require("../utils");

const createRespone = catchAsync(async (req, res) => {
  const { idReview } = req.params;
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
  const existed = await responeModel.findOne({ reviewId: idReview });
  console.log(existed);

  if (existed) {
    throw new CustomException("You have already responded to this review", 400);
  }

  const respone = await responeModel.create({
    reviewId: idReview,
    freelancerId: req.user._id,
    description: req.body.description,
    like: req.body.like || false,
  });

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

module.exports = { createRespone };
