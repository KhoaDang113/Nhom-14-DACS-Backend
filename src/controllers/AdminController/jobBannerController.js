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

const updateJobBanner = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, cta, ctaLink } = req.body;
  const image = req.file;

  const updateData = {
    title,
    description,
    cta: cta || "View Now",
    ctaLink,
  };

  if (image) {
    updateData.image = {
      type: "image",
      url: image.path,
    };
  }

  const updatedJobBanner = await jobBannerModel.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );

  if (!updatedJobBanner) {
    throw new CustomException("Job banner not found", 404);
  }

  return res.status(200).json({
    status: "success",
    data: updatedJobBanner,
  });
});

const deletedJobBanner = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedJobBanner = await jobBannerModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  if (!deletedJobBanner) {
    throw new CustomException("Job banner not found", 404);
  }

  return res.status(200).json({
    status: "success",
    message: "Job banner deleted successfully",
  });
});

const getJobBannerById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const jobBanner = await jobBannerModel
    .findById(id)
    .select("_id title description image cta ctaLink createdAt updatedAt");

  if (!jobBanner || jobBanner.isDeleted) {
    throw new CustomException("Job banner not found", 404);
  }

  return res.status(200).json({
    status: "success",
    data: jobBanner,
  });
});

module.exports = {
  createJobBanner,
  getListJobBanner,
  updateJobBanner,
  deletedJobBanner,
  getJobBannerById,
};
