const { userModel } = require("../models");
const { catchAsync, CustomException } = require("../utils");

const getMe = catchAsync(async (req, res) => {
  const user = await userModel.findOne({ clerkId: req.UserID });
  if (!user) {
    throw new CustomException("User not found", 404);
  }
  res.status(200).json({
    error: false,
    message: "User details",
    user,
  });
});

module.exports = { getMe };
