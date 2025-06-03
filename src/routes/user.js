const userRouter = require("express").Router();
const { getMe, getUserById } = require("../controllers/userController");

const authUser = require("../middlewares/authUser");

userRouter.get("/me", authUser, getMe);
userRouter.get("/profile/:userId", authUser, getUserById);
module.exports = userRouter;
