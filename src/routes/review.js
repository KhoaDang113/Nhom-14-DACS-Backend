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

module.exports = reviewRouter;
