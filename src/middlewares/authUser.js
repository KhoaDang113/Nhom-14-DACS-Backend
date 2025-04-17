const { userModel } = require("../models");
const { CustomException, catchAsync } = require("../utils");

const authUser = catchAsync(async (req, res, next) => {
  const userId = req.auth?.userId;
  if (!userId) throw new CustomException("Unauthorized", 401);

  const user = await userModel.findOne({ clerkId: userId });
  if (!user) throw new CustomException("User not found", 404);
  if (user.isLocked) {
    throw new CustomException("Your account has been locked", 403);
  }
  req.UserID = userId;
  req.user = user;

  next();
});

module.exports = authUser;
