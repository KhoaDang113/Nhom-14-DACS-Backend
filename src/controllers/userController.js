const { userModel } = require("../models");
const { catchAsync, CustomException } = require("../utils");

const getMe = catchAsync(async (req, res) => {
  const user = await userModel.findById(req.user._id).select("-__v");
  res.status(200).json({
    error: false,
    message: "User details retrieved successfully.",
    user,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const user = await userModel
    .findById(userId)
    .select("name email avatar role createdAt")
    .lean();

  if (!user) {
    return res.status(404).json({
      error: true,
      message: "Không tìm thấy người dùng",
    });
  }

  return res.status(200).json({
    error: false,
    message: "Lấy thông tin người dùng thành công",
    user,
  });
});

// const updateUser = catchAsync(async (req, res) => {
//   const { userId } = req.params;
//   const { name, avatar } = req.body;

//   const user = await userModel.findByIdAndUpdate(
//     userId,
//     { name, avatar },
//     { new: true, runValidators: true }
//   );

//   if (!user) {
//     return res.status(404).json({
//       error: true,
//       message: "Không tìm thấy người dùng",
//     });
//   }

//   return res.status(200).json({
//     error: false,
//     message: "Cập nhật thông tin người dùng thành công",
//     user,
//   });
// });

module.exports = {
  getMe,
  getUserById,
  // updateUser,
};
