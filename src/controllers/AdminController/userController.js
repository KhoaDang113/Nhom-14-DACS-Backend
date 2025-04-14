const { userModel } = require("../../models");
const { CustomException, catchAsync } = require("../../utils");

const getAllUser = catchAsync(async (req, res) => {
  const users = await userModel
    .find({ role: { $in: ["freelancer", "customer"] } })
    .select("_id name email role isLocked createdAt")
    .lean();

  res.status(200).json({
    error: false,
    message: "Danh sách người dùng",
    users,
  });
});

const getUserDetail = catchAsync(async (req, res) => {
  const user = await userModel
    .findById(req.params.idUser)
    .select("_id name email role isLocked createdAt")
    .lean();

  if (!user) {
    throw new CustomException("user not found", 404);
  }

  res.status(200).json({
    error: false,
    message: "user details",
    user,
  });
});

const toggleLockUser = catchAsync(async (req, res) => {
  const user = await userModel
    .findById(req.params.idUser)
    .select("_id name email role isLocked createdAt");
  if (!user) {
    throw new CustomException("user not found", 404);
  }

  user.isLocked = !user.isLocked;
  await user.save();

  res.status(200).json({
    error: false,
    message: `${user.isLocked ? "locked" : "unlocked"} user success`,
    user,
  });
});

module.exports = { getAllUser, getUserDetail, toggleLockUser };
