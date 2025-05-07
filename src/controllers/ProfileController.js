const { freelancerProfileModel, userModel } = require("../models");
const { CustomException, catchAsync } = require("../utils");

const createFreelancerProfile = catchAsync(async (req, res) => {
  const existingProfile = await freelancerProfileModel.findOne({
    freelancerId: req.user._id,
  });
  if (existingProfile) throw new CustomException("Profile already exists", 400);
  const profileData = {
    freelancerId: req.user._id,
    fullName: req.body.fullName,
    industry: req.body.industry || "",
    hardSkill: req.body.hardSkill || "",
    softSkill: req.body.softSkill || "",
    languages: req.body.languages || "",
    country: req.body.country || "",
    education: req.body.education || "",
    description: req.body.description || "",
    certificates: req.body.certificates || "",
  };

  const profile = new freelancerProfileModel(profileData);
  await profile.save();

  await userModel.updateOne(
    { _id: req.user._id },
    { $set: { role: "freelancer" } }
  );
  const profileResponse = await freelancerProfileModel
    .findById(profile._id)
    .select(
      "fullName industry hardSkill softSkill languages country education description certificates"
    )
    .lean();
  return res.status(201).json({
    error: false,
    message: "Profile created successfully. User is now a freelancer.",
    data: profileResponse,
  });
});

const getFreelancerProfile = catchAsync(async (req, res) => {
  const freelancerProfiles = await freelancerProfileModel
    .findOne({ freelancerId: req.user._id })
    .select(
      "fullName industry hardSkill softSkill languages country education description certificates"
    )
    .lean();
  if (!freelancerProfiles) {
    throw new CustomException("profile is not found", 404);
  }
  return res.status(200).json({
    error: false,
    message: "get profile successfully!!",
    data: freelancerProfiles,
  });
});

const updateFreelancerProfile = catchAsync(async (req, res) => {
  const {
    fullName,
    industry,
    hardSkill,
    softSkill,
    languages,
    country,
    education,
    description,
    certificates,
  } = req.body;
  const freelancerProfile = await freelancerProfileModel
    .findOneAndUpdate(
      { freelancerId: req.user._id },
      {
        fullName,
        industry,
        hardSkill,
        softSkill,
        languages,
        country,
        education,
        description,
        certificates,
      },
      { new: true }
    )
    .select(
      "fullName industry hardSkill softSkill languages country education description certificates"
    )
    .lean();

  if (!freelancerProfile) {
    throw new CustomException("profile is not found", 404);
  }

  return res.status(200).json({
    error: false,
    message: "Profile updated successfully",
    data: freelancerProfile,
  });
});

const getUserProfile = catchAsync(async (req, res) => {
  // Lấy ID người dùng từ request (có thể là ID của chính user hoặc ID truyền vào từ params)
  const userId = req.params.userId || req.user._id;

  // Lấy thông tin cơ bản của người dùng
  const user = await userModel
    .findById(userId)
    .select("_id name email role createdAt avatar country description")
    .lean();

  if (!user) {
    throw new CustomException("Không tìm thấy thông tin người dùng", 404);
  }

  // Khởi tạo đối tượng response
  const userResponse = {
    ...user,
    hardSkill: "",
    softSkill: "",
    languages: "",
    education: "",
    certificates: "",
  };

  // Nếu là freelancer, lấy thêm thông tin chi tiết từ freelancerProfile
  if (user.role === "freelancer") {
    const freelancerProfile = await freelancerProfileModel
      .findOne({ freelancerId: userId })
      .select(
        "fullName industry hardSkill softSkill languages country education description certificates"
      )
      .lean();

    if (freelancerProfile) {
      userResponse.hardSkill = freelancerProfile.hardSkill || "";
      userResponse.softSkill = freelancerProfile.softSkill || "";
      userResponse.languages = freelancerProfile.languages || "";
      userResponse.education = freelancerProfile.education || "";
      userResponse.certificates = freelancerProfile.certificates || "";
      userResponse.industry = freelancerProfile.industry || "";
      // Ưu tiên lấy description từ freelancerProfile nếu có
      userResponse.description =
        freelancerProfile.description || user.description || "";
    }
  }

  return res.status(200).json({
    error: false,
    message: "Lấy thông tin người dùng thành công",
    data: userResponse,
  });
});

module.exports = {
  createFreelancerProfile,
  getFreelancerProfile,
  updateFreelancerProfile,
  getUserProfile,
};
