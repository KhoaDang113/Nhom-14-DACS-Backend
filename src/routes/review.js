const reviewRouter = require("express").Router();
const reviewController = require("../controllers/reviewController");
const authUser = require("../middlewares/authUser");
const validate = require("../middlewares/validateMiddleware");
const { createReview } = require("../validator/reviewValidate");

reviewRouter.post(
  "/:idGig/create",
  authUser,
  validate(createReview),
  reviewController.createReview
);
reviewRouter.get("/:idGig/get", reviewController.getAllReview);
reviewRouter.get("/:idGig/get-review-start", reviewController.ratingStart);
reviewRouter.get(
  "/check/:orderId",
  authUser,
  reviewController.checkIfOrderReviewed
); //add - New route to check if an order has been reviewed
// Thêm route mới để kiểm tra chi tiết đánh giá của đơn hàng
reviewRouter.get(
  "/order/:orderId",
  authUser,
  reviewController.checkOrderReviewed
);
// Thêm route để lấy danh sách đánh giá của người bán
reviewRouter.get(
  "/freelancer/:id?",
  authUser,
  reviewController.getFreelancerReviews
);

// Thêm route mới để lấy reviews cho frontend
reviewRouter.get(
  "/gig/:gigId/frontend",
  reviewController.getGigReviewsForFrontend
);

module.exports = reviewRouter;
