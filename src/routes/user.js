const userRouter = require("express").Router();
const {
  getMe,
  getUserById,
  updateUser,
} = require("../controllers/userController");

const authUser = require("../middlewares/authUser");

userRouter.get("/me", authUser, getMe);
userRouter.get("/profile/:userId", authUser, getUserById);
// userRouter.get("/update/:id", authUser, updateUser);
module.exports = userRouter;
