const { jobBannerModel } = require("../../models");
const { CustomException, catchAsync } = require("../../utils");

const createJobBanner = catchAsync(async (req, res) => {
  const { title, description, cta, ctaLink } = req.body;
  const image = req.file;
  const media = {
    type: "image",
    url: image.path,
  };
  const dataJobBanner = {
    title,
    description,
    image: media,
    cta: cta || "View Now",
    ctaLink,
  };
  const newJobBanner = await jobBannerModel.create(dataJobBanner);
  if (!newJobBanner) {
    throw new CustomException("Failed to create job banner", 500);
  }

  const jobBannerResponse = {
    _id: newJobBanner._id,
    title: newJobBanner.title,
    description: newJobBanner.description,
    image: newJobBanner.image,
    cta: newJobBanner.cta,
    ctaLink: newJobBanner.ctaLink,
  };

  return res.status(201).json({
    status: "success",
    data: jobBannerResponse,
  });
});

const getListJobBanner = catchAsync(async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  const jobBanners = await jobBannerModel
    .find({ isDeleted: false })
    .select("_id title description image cta ctaLink createdAt updatedAt")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalJobBanners = await jobBannerModel.countDocuments({
    isDeleted: false,
  });

  return res.status(200).json({
    status: "success",
    data: {
      jobBanners,
      totalPages: Math.ceil(totalJobBanners / limit),
      currentPage: page,
    },
  });
});

module.exports = { createJobBanner, getListJobBanner };
