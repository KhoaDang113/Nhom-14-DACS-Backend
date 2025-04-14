const userAdminController = require("../../controllers/AdminController/userController");
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

module.exports = userAdminRouter;
