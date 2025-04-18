const { reviewVoteModel, reviewModel } = require("../models");
const { CustomException, catchAsync } = require("../utils");

const createIsHelpFull = catchAsync(async (req, res) => {
  const { idReview, isHelpFull } = req.body;
  const review = await reviewModel.findById(idReview);
  if (!review) {
    throw new CustomException("Review not found", 404);
  }
  const existingVote = await reviewVoteModel
    .findOne({
      reviewId: idReview,
      userId: req.user._id,
    })
    .select("_id reviewId userId isHelpFull updateAt");
  if (existingVote) {
    let isLike;
    if (isHelpFull === existingVote.isHelpFull) {
      existingVote.isHelpFull = "none";
      isLike = `un${isHelpFull}`;
    } else {
      existingVote.isHelpFull = isHelpFull;
      isLike = isHelpFull;
    }
    await existingVote.save();
    return res.status(201).json({
      success: true,
      message: `${isLike} successfully`,
      existingVote,
    });
  }
  const vote = new reviewVoteModel({
    reviewId: idReview,
    userId: req.user._id,
    isHelpFull,
  });

  await vote.save();
  return res.status(201).json({
    success: true,
    message: "Vote created successfully",
    vote: {
      _id: vote._id,
      reviewId: vote.reviewId,
      userId: vote.userId,
      isHelpFull: vote.isHelpFull,
      createdAt: vote.createdAt,
    },
  });
});

module.exports = { createIsHelpFull };
