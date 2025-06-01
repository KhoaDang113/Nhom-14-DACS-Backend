const {
  reviewModel,
  orderModel,
  gigModel,
  responseModel,
  reviewVoteModel,
} = require("../models");
const mongoose = require("mongoose");
const { CustomException, catchAsync } = require("../utils");

const filteredReview = (reviewObj) => {
  return {
    id: reviewObj._id,
    userId: reviewObj.userId || reviewObj.customerId,
    gigId: reviewObj.gigId,
    title: reviewObj.title || "",
    description: reviewObj.description,
    star: reviewObj.star,
    priceRange: reviewObj.priceRange,
    duration: reviewObj.duration,
    orderId: reviewObj.orderId || null,
    createdAt: reviewObj.createdAt,
  };
};

const createReview = catchAsync(async (req, res) => {
  const { idGig } = req.params;
  const { orderId } = req.body; //add
  const userId = req.user._id;

  // Find the gig//add
  const gig = await gigModel.findById(idGig);
  if (!gig) throw new CustomException("Gig not found", 404);

  // Check that the user is not reviewing their own gig
  if (gig.freelancerId === req.user._id) {
    throw new CustomException("You cannot review your own gig", 403);
  }

  // If orderId is provided, verify it belongs to this user and gig
  if (orderId) {
    const order = await orderModel.findById(orderId);
    if (!order) {
      throw new CustomException("Order not found", 404);
    }

    // Verify the order belongs to this user
    if (order.customerId.toString() !== userId.toString()) {
      throw new CustomException(
        "You are not authorized to review this order",
        403
      );
    }

    // Verify the order is for this gig
    if (order.gigId.toString() !== idGig) {
      throw new CustomException("This order is not for the specified gig", 400);
    }

    // Verify the order is completed
    if (order.status !== "completed") {
      throw new CustomException("You can only review completed orders", 400);
    }
  } else {
    // If no orderId provided, check that the user has purchased this gig
    const hasPurchased = await orderModel.exists({
      customerId: userId,
      gigId: idGig,
      status: "completed",
    });

    if (!hasPurchased) {
      throw new CustomException(
        "You must complete an order for this gig before reviewing",
        403
      );
    }
  }

  // Check if the user has already reviewed this gig
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
    title: req.body.title || `Review for ${gig.title}`, //add
    description: req.body.description,
    star: req.body.star,
    priceRange: gig.price,
    duration: gig.duration,
    orderId: orderId || null,
  });
  const gigUpdate = await gigModel.findById(idGig);
  if (!gigUpdate) {
    throw new CustomException("Failed to update gig ratings", 500);
  }
  gigUpdate.star =
    (gigUpdate.star * gigUpdate.ratingsCount + newReview.star) /
    (gigUpdate.ratingsCount + 1);
  gigUpdate.ratingsCount += 1;
  await gigUpdate.save();
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

const ratingStart = catchAsync(async (req, res) => {
  const { idGig } = req.params;
  const gig = await gigModel.findById(idGig);
  if (!gig) throw new CustomException("Gig not found", 404);
  const reviews = await reviewModel
    .find({ gigId: idGig })
    .select("gigId star")
    .lean();
  const totalStar = reviews.reduce((acc, review) => acc + review.star, 0);
  const averageStar = reviews.length
    ? Number(totalStar / reviews.length).toFixed(1)
    : 0;
  const rating = {
    totalStar: totalStar,
    averageStar: averageStar,
    totalReview: reviews.length,
  };
  return res.status(200).json({
    error: false,
    message: "get rating successfully",
    rating,
  });
});

const checkIfOrderReviewed = catchAsync(async (req, res) => {
  const { orderId } = req.params;

  // First, find the order to get the gigId
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw new CustomException("Order not found", 404);
  }

  // Check if the current user is the customer of this order
  if (req.user._id.toString() !== order.customerId.toString()) {
    throw new CustomException("You are not authorized to view this order", 403);
  }

  // Check if order status is completed
  if (order.status !== "completed") {
    return res.status(200).json({
      error: false,
      message: "Order is not completed yet",
      isReviewed: false,
      canReview: false,
    });
  }

  // Check if there's already a review for this order by this customer
  const existingReview = await reviewModel.findOne({
    customerId: req.user._id,
    gigId: order.gigId,
  });

  return res.status(200).json({
    error: false,
    message: existingReview
      ? "Order has already been reviewed"
      : "Order can be reviewed",
    isReviewed: !!existingReview,
    canReview: !existingReview,
  });
});

const checkOrderReviewed = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  // Kiểm tra xem đơn hàng có tồn tại không
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw new CustomException("Đơn hàng không tồn tại", 404);
  }

  // Kiểm tra xem đơn hàng có thuộc về người dùng không
  if (order.customerId.toString() !== userId.toString()) {
    throw new CustomException(
      "Bạn không có quyền truy cập thông tin đơn hàng này",
      403
    );
  }

  // Kiểm tra xem đơn hàng đã được đánh giá chưa
  const existingReview = await reviewModel.findOne({ orderId });

  return res.status(200).json({
    error: false,
    message: "Kiểm tra đánh giá thành công",
    isReviewed: !!existingReview,
    reviewId: existingReview ? existingReview._id : null,
  });
});

const getFreelancerReviews = catchAsync(async (req, res) => {
  const freelancerId = req.params.id || req.user._id;

  const reviews = await reviewModel
    .find({ freelancerId })
    .populate("customerId", "name avatar")
    .populate("gigId", "title")
    .populate("orderId")
    .select("rating comment createdAt customerId gigId orderId")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    error: false,
    message: "Lấy danh sách đánh giá thành công",
    reviews,
  });
});

const getGigReviewsForFrontend = catchAsync(async (req, res) => {
  const { gigId } = req.params;

  // Validate gigId
  if (!mongoose.Types.ObjectId.isValid(gigId)) {
    throw new CustomException("Invalid gigId", 400);
  }

  // Check if gig exists
  const gig = await gigModel.findById(gigId);
  if (!gig) {
    throw new CustomException("Gig not found", 404);
  }

  // Get all reviews for this gig
  const reviews = await reviewModel
    .find({ gigId })
    .populate("customerId", "name avatar")
    .sort({ createdAt: -1 })
    .lean();

  // Map reviews to format expected by frontend
  const formattedReviews = reviews.map((review) => ({
    id: review._id.toString(),
    customerId: review.customerId._id.toString(),
    customerName: review.customerId.name || "Người dùng ẩn danh",
    customerAvatar:
      review.customerId.avatar || "https://via.placeholder.com/40",
    gigId: review.gigId.toString(),
    gigTitle: gig.title,
    rating: review.star,
    comment: review.description, // Chuyển description sang comment để phù hợp với CustomerReview interface
    date: review.createdAt,
    priceRange: review.priceRange ? review.priceRange.toString() : "",
    duration: review.duration || 0,
    isResponse: review.isResponse,
  }));

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.star, 0);
  const averageRating = reviews.length
    ? (totalRating / reviews.length).toFixed(1)
    : 0;

  return res.status(200).json({
    error: false,
    message: "Reviews retrieved successfully",
    reviews: formattedReviews,
    stats: {
      total: reviews.length,
      averageRating: parseFloat(averageRating),
    },
  });
});

module.exports = {
  createReview,
  getAllReview,
  ratingStart,
  checkIfOrderReviewed,
  checkOrderReviewed,
  getFreelancerReviews,
  getGigReviewsForFrontend,
};
