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
module.exports = {
  createFreelancerProfile,
  getFreelancerProfile,
  updateFreelancerProfile,
};
