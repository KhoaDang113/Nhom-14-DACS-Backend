const profileRouter = require("express").Router();
const profileController = require("../controllers/ProfileController");
const authUser = require("../middlewares/authUser");
const { roleMiddleware } = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validateMiddleware");
const {
  createFreelancerProfile,
  updateFreelancerProfile,
} = require("../validator/profileValidation");
profileRouter.post(
  "/create",
  authUser,
  roleMiddleware("customer"),
  validate(createFreelancerProfile),
  profileController.createFreelancerProfile
);
profileRouter.get(
  "/get",
  authUser,
  roleMiddleware("freelancer"),
  profileController.getFreelancerProfile
);
profileRouter.put(
  "/update",
  authUser,
  roleMiddleware("freelancer"),
  validate(updateFreelancerProfile),
  profileController.updateFreelancerProfile
);

module.exports = profileRouter;
