const {
  reviewModel,
  orderModel,
  gigModel,
  responseModel,
  reviewVoteModel,
} = require("../models");
const { CustomException, catchAsync } = require("../utils");

const filteredReview = (reviewObj) => {
  return {
    id: reviewObj._id,
    userId: reviewObj.userId,
    gigId: reviewObj.gigId,
    description: reviewObj.description,
    star: reviewObj.star,
    priceRange: reviewObj.priceRange,
    duration: reviewObj.duration,
    createdAt: reviewObj.createdAt,
  };
};

const createReview = catchAsync(async (req, res) => {
  const { idGig } = req.params;
  const userId = req.user._id;
  const gig = await gigModel.findById(idGig);
  if (!gig) throw new CustomException("Gig not found", 404);
  if (gig.freelancerId === req.UserId) {
    throw new CustomException("You cannot review your own gig", 403);
  }

  const hasPurchased = await orderModel.exists({
    customerId: userId,
    gigId: idGig,
  });
  if (!hasPurchased) {
    throw new CustomException(
      "You must purchase this gig before reviewing",
      403
    );
  }
  const alreadyReviewed = await reviewModel.exists({
    customerId: userId,
    gigId: idGig,
  });
  if (alreadyReviewed) {
    throw new CustomException("You have already reviewed this gig", 400);
  }
  const newReview = await reviewModel.create({
    customerId: userId,
    gigId: idGig,
    description: req.body.description,
    star: req.body.star,
    priceRange: gig.price,
    duration: gig.duration,
  });
  const reviewObj = filteredReview(newReview.toObject());
  return res.status(200).json({
    error: false,
    message: "Review created successfully!",
    review: reviewObj,
  });
});

const getAllReview = catchAsync(async (req, res) => {
  const gig = await gigModel.findById(req.params.idGig);
  if (!gig) throw new CustomException("Gig not found", 404);
  const reviews = await reviewModel
    .find({ gigId: req.params.idGig })
    .populate("customerId", "name email")
    .select("gigId customerId star description priceRange duration createAt")
    .lean();
  const reviewIds = reviews.map((review) => review._id);
  const responses = await responseModel
    .find({ reviewId: { $in: reviewIds } })
    .populate("freelancerId", "name")
    .lean();
  const votes = await reviewVoteModel
    .find({ reviewId: { $in: reviewIds } })
    .lean();

  const reviewsWithDetails = reviews.map((review) => {
    const reviewResponse = responses.find(
      (res) => res.reviewId.toString() === review._id.toString()
    );
    const reviewVotes = votes.filter(
      (vote) => vote.reviewId.toString() === review._id.toString()
    );
    const helpfulVotes = reviewVotes.filter(
      (vote) => vote.isHelpFull === "like"
    ).length;
    const notHelpfulVotes = reviewVotes.filter(
      (vote) => vote.isHelpFull === "dislike"
    ).length;

    return {
      _id: review._id,
      gigId: review.gigId,
      customer: {
        name: review.customerId?.name || "Unknown",
        country: review.customerId?.email || null,
      },
      star: review.star,
      description: review.description,
      priceRange: review.priceRange,
      duration: review.duration,
      createdAt: review.createdAt,
      response: reviewResponse
        ? {
            _id: reviewResponse._id,
            freelancerName: reviewResponse.freelancerId?.name || "Unknown",
            like: reviewResponse.like,
            description: reviewResponse.description,
            createdAt: reviewResponse.createdAt,
          }
        : null,
      votes: {
        helpful: helpfulVotes,
        notHelpful: notHelpfulVotes,
      },
    };
  });
  return res.status(200).json({
    error: false,
    message: "get list review successfully",
    reviewsWithDetails,
  });
});

module.exports = { createReview, getAllReview };
