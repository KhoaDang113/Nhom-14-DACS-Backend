const userAdminController = require("../../controllers/AdminController/userController");
const profileController = require("../../controllers/ProfileController");
const userAdminRouter = require("express").Router();
const authUser = require("../../middlewares/authUser");
const { roleMiddleware } = require("../../middlewares/roleMiddleware");

userAdminRouter.get(
  "/get",
  authUser,
  roleMiddleware("admin"),
  userAdminController.getAllUser
);
userAdminRouter.get(
  "/:idUser/get",
  authUser,
  roleMiddleware("admin"),
  userAdminController.getUserDetail
);
userAdminRouter.put(
  "/:idUser/is-locked",
  authUser,
  roleMiddleware("admin"),
  userAdminController.toggleLockUser
);

// Thêm route mới để lấy thông tin chi tiết profile của người dùng
userAdminRouter.get(
  "/:idUser/profile",
  authUser,
  roleMiddleware("admin"),
  (req, res, next) => {
    // Sử dụng lại API profile nhưng qua route của admin
    req.params.userId = req.params.idUser;
    next();
  },
  profileController.getUserProfile
);

module.exports = userAdminRouter;
