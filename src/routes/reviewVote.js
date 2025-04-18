const reviewVoteRouter = require("express").Router();
const reviewVoteController = require("../controllers/reviewVoteController");
const authUser = require("../middlewares/authUser");
const validate = require("../middlewares/validateMiddleware");
const { createReviewVote } = require("../validator/reviewVoteValidator");

reviewVoteRouter.post(
  "/create",
  authUser,
  validate(createReviewVote),
  reviewVoteController.createIsHelpFull
);

module.exports = reviewVoteRouter;
