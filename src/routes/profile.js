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
profileRouter.get("/get", authUser, profileController.getFreelancerProfile);
profileRouter.put(
  "/update",
  authUser,
  roleMiddleware("freelancer"),
  validate(updateFreelancerProfile),
  profileController.updateFreelancerProfile
);

// Thêm route mới cho API lấy thông tin người dùng
profileRouter.get("/user", authUser, profileController.getUserProfile);

// Route để admin hoặc người dùng khác có thể xem thông tin của một người dùng cụ thể
profileRouter.get(
  "/user/:userId",

  authUser,
  profileController.getUserProfile
);

module.exports = profileRouter;
