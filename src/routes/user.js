const userRouter = require("express").Router();
const { getMe } = require("../controllers/userController");

const authUser = require("../middlewares/authUser");

userRouter.get("/me", authUser, getMe);
module.exports = userRouter;
