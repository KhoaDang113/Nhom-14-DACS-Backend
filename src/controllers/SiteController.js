const {
  gigModel,
  categoryModel,
  orderModel,
  userModel,
  gigPackageModel,
  jobBannerModel,
} = require("../models");
const mongoose = require("mongoose");
const CustomException = require("../utils/CustomException");
const { catchAsync, formatGigs } = require("../utils");

const getAllCategory = catchAsync(async (req, res) => {
  const categories = await categoryModel
    .find({ parentCategory: null, isDeleted: false })
    .lean();

  const categoriesWithChildren = await Promise.all(
    categories.map(async (category) => {
      const subcategories = await categoryModel
        .find({ parentCategory: category._id, isDeleted: false })
        .lean();

      const subcategoriesWithChildren = await Promise.all(
        subcategories.map(async (subcategory) => {
          const subcategoryChildren = await categoryModel
            .find({ parentCategory: subcategory._id, isDeleted: false })
            .lean();
          return { ...subcategory, subcategoryChildren };
        })
      );

      return { ...category, subcategories: subcategoriesWithChildren };
    })
  );

  return res.status(200).json({
    error: false,
    message: "Categories retrieved successfully",
    data: categoriesWithChildren,
  });
});

const getDetailGig = catchAsync(async (req, res) => {
  const gig = await gigModel
    .findOne({
      _id: req.params.idGig,
      status: "approved",
      isDeleted: false,
    })
    .select(
      "_id freelancerId category_id views status ordersCompleted title description price media duration star ratingsCount createdAt updatedAt"
    )
    .lean();
  if (!gig) throw new CustomException("Gig not found", 404);
  await gigModel.updateOne({ _id: gig._id }, { $inc: { views: 1 } });
  const freelancer = await userModel.findOne({ clerkId: gig.freelancerId });

  if (!freelancer) throw new CustomException("freelancer not found", 404);
  const gigPackage = await gigPackageModel.findOne({ gigId: gig._id });
  return res.status(200).json({
    gig,
    freelancerId: freelancer._id,
    packageId: gigPackage ? gigPackage._id : null,
  });
});
const searchGig = catchAsync(async (req, res) => {
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    page = 1,
    limit = 12,
    sortBy = "recommended",
  } = req.query;
  const query = {
    status: "approved",
    isDeleted: false,
  };
  if (keyword && typeof keyword === "string" && keyword.trim() !== "") {
    query.$text = { $search: keyword.trim() };
  }

  if (category) {
    if (!mongoose.Types.ObjectId.isValid(category)) {
      throw new CustomException("Invalid categoryId format", 400);
    }
    query.category_id = category;
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (Number(minPrice) >= Number(maxPrice)) {
      throw new CustomException(
        "The minimum price must be less than the maximum price",
        400
      );
    }
    if (minPrice)
      query.price.$gte = mongoose.Types.Decimal128.fromString(
        minPrice.toString()
      );
    if (maxPrice)
      query.price.$lte = mongoose.Types.Decimal128.fromString(
        maxPrice.toString()
      );
  }
  let sortCriteria = {};
  switch (sortBy.toLowerCase()) {
    case "hot":
      sortCriteria = { ordersCompleted: -1 };
      break;
    case "new":
      sortCriteria = { createdAt: -1 };
      break;
    case "recommended":
    default:
      sortCriteria = { views: -1, ordersCompleted: -1 };
      break;
  }

  let gigsQuery = gigModel
    .find(query)
    .select(
      "_id title description keywords price media duration status category_id freelancerId views ordersCompleted createdAt updatedAt star ratingsCount"
    );
  if (query.$text) {
    gigsQuery = gigsQuery
      .select({ score: { $meta: "textScore" } })
      .sort({ ...sortCriteria, score: { $meta: "textScore" } });
  } else {
    gigsQuery = gigsQuery.sort(sortCriteria);
  }
  const gigs = await gigsQuery
    .skip((page - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .lean();
  const formattedGigs = await formatGigs(gigs);
  const total = await gigModel.countDocuments(query);
  const totalPages = Math.ceil(total / parseInt(limit));
  return res.status(200).json({
    error: false,
    message: gigs.length ? "Gigs retrieved successfully" : "No gigs found",
    totalPages,
    totalResults: total,
    gigs: formattedGigs,
  });
});

const getAllGig = catchAsync(async (req, res) => {
  const gigs = await gigModel
    .find({ status: "approved", isDeleted: false })
    // .select("_id title price media duration freelancerId category_id createdAt")
    .lean();
  if (!gigs || gigs.length === 0) {
    throw new CustomException("No gigs found", 404);
  }
  const formattedGigs = await formatGigs(gigs);

  return res.status(200).json({
    error: false,
    message: "Gigs retrieved successfully",
    gigs: formattedGigs,
  });
});

const getPopularCategories = catchAsync(async (req, res) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // 30 days ago

  const orders = await orderModel
    .find({
      createdAt: { $gte: startDate },
    })
    .populate({
      path: "gigId",
      select: "category_id",
    });

  if (orders.length === 0) {
    throw new CustomException("No orders found", 404);
  }

  const categoryCount = {};
  orders.forEach((order) => {
    const categoryId = order.gigId?.category_id.toString();
    if (categoryId) {
      categoryCount[categoryId] = (categoryCount[categoryId] || 0) + 1;
    }
  });
  const categoryCountArray = Object.entries(categoryCount).map(
    ([categoryId, count]) => ({ categoryId, count })
  );

  const topCategories = categoryCountArray
    .toSorted((a, b) => b.count - a.count)
    .slice(0, 10);

  const categoryIds = topCategories.map((cat) => cat.categoryId);
  const categories = await categoryModel.find({ _id: { $in: categoryIds } });

  const popularCategories = categoryIds.map((categoryId) => {
    const category = categories.find(
      (cat) => cat._id.toString() === categoryId
    );
    return {
      categoryId: categoryId,
      categoryName: category ? category.name : "Unknown",
    };
  });

  if (!popularCategories.length) {
    throw new CustomException(
      "No popular categories found in the last 30 days",
      404
    );
  }

  return res.status(200).json({
    error: false,
    message: "Popular categories retrieved successfully",
    data: popularCategories,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const user = await userModel
    .findById(userId)
    .select("name email avatar clerkId role facebookId googleId")
    .lean();
  if (!user) throw new CustomException("User not found", 404);
  return res.status(200).json({
    error: false,
    message: "User retrieved successfully",
    data: user,
  });
});

const getGigsByCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new CustomException("Invalid categoryId format", 400);
  }
  const gigs = await gigModel
    .find({ category_id: categoryId, status: "approved", isDeleted: false })
    .select(
      "_id title description keywords price media duration status category_id freelancerId views ordersCompleted createdAt"
    )
    .lean();
  if (!gigs || gigs.length === 0) {
    throw new CustomException("No gigs found in this category", 404);
  }
  const formattedGigs = await formatGigs(gigs);

  return res.status(200).json({
    error: false,
    message: "Gigs retrieved successfully",
    gigs: formattedGigs,
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

const getListJobHots = catchAsync(async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  const jobBanners = await gigModel
    .find({ isDeleted: false, status: "approved", isHot: true })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();
  const formattedJobBanners = await formatGigs(jobBanners);
  const totalJobBanners = await jobBannerModel.countDocuments({
    isDeleted: false,
  });

  return res.status(200).json({
    status: "success",
    data: {
      formattedJobBanners,
      totalPages: Math.ceil(totalJobBanners / limit),
      currentPage: page,
    },
  });
});

module.exports = {
  getAllCategory,
  getDetailGig,
  searchGig,
  getPopularCategories,
  getAllGig,
  getUserById,
  getGigsByCategory,
  getListJobBanner,
  getListJobHots,
};
