const { freelancerProfileModel, userModel } = require("../models");
const { CustomException } = require("../utils");
const createFreelancerProfile = async (req, res) => {
  try {
    const user = await userModel.findOne({ clerkId: req.UserID });
    if (user.role === "freelancer") {
      throw CustomException("User is already a freelancer", 400);
    }

    if (user.role !== "customer") {
      throw CustomException("Only customers can become freelancers", 403);
    }
    const existingProfile = await freelancerProfileModel.findOne({
      freelancerId: user._id,
    });
    if (existingProfile) throw CustomException("Profile already exists", 400);
    if (!req.body.fullName) {
      throw CustomException("Missing required field: fullName", 400);
    }

    const profileData = {
      freelancerId: user._id,
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
      { _id: user._id },
      { $set: { role: "freelancer" } }
    );

    return res.status(201).json({
      error: false,
      message: "Profile created successfully. User is now a freelancer.",
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { createFreelancerProfile };
