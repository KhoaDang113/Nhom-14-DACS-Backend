const profileRouter = require("express").Router();
const profileController = require("../controllers/ProfileController");
const userMiddleware = require("../middlewares/userMiddleware");

profileRouter.post(
  "/create",
  userMiddleware,
  profileController.createFreelancerProfile
);

module.exports = profileRouter;
