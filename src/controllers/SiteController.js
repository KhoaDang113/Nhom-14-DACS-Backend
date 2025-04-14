const { gigModel, categoryModel, orderModel } = require("../models");
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
          const children = await categoryModel
            .find({ parentCategory: subcategory._id, isDeleted: false })
            .lean();
          return { ...subcategory, children };
        })
      );

      return { ...category, children: subcategoriesWithChildren };
    })
  );

  return res.status(200).json({
    error: false,
    message: "Categories retrieved successfully",
    data: categoriesWithChildren,
  });
});

// const searchGig = async (req, res) => {
//   try {
//     const { keyword, category, minPrice, maxPrice } = req.query;
//     if (!keyword || typeof keyword !== "string") {
//       throw new CustomException("Missing or invalid keyword", 400);
//     }
//     const query = {
//       $text: {
//         $search: keyword,
//       },
//       status: "approved",
//     };

//     if (category) {
//       if (!mongoose.Types.ObjectId.isValid(category)) {
//         throw new CustomException(
//           "Invalid categoryId format (it must be have 24 character)",
//           400
//         );
//       }
//       query.category_id = category;
//     }
//     if (minPrice || maxPrice) {
//       query.price = {};
//       if (Number(minPrice) >= Number(maxPrice)) {
//         return res.status(400).json({
//           message: "The minimum price must be less than the maximum price",
//         });
//       }
//       if (minPrice)
//         query.price.$gte = mongoose.Types.Decimal128.fromString(
//           minPrice.toString()
//         );
//       if (maxPrice)
//         query.price.$lte = mongoose.Types.Decimal128.fromString(
//           maxPrice.toString()
//         );
//     }
//     const gigs = await gigModel
//       .find(query, { score: { $meta: "textScore" } })
//       .sort({ score: { $meta: "textScore" } })
//       .limit(10)
//       .select(
//         "_id title description keywords price media duration status category_id"
//       )
//       .lean();

//     if (!gigs.length) {
//       return res.status(404).json({ message: "No gigs found" });
//     }
//     return res.status(200).json({
//       message: "Gigs retrieved successfully",
//       gigs,
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };
const searchGig = catchAsync(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, page = 1 } = req.query;

  const query = {
    status: "approved",
    isDeleted: false, // 👈 lọc gig chưa bị xoá mềm
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

  let gigsQuery = gigModel
    .find(query)
    .select(
      "_id title description keywords price media duration status category_id"
    );

  if (query.$text) {
    gigsQuery = gigsQuery
      .select({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } });
  }

  const gigs = await gigsQuery
    .skip((page - 1) * 20)
    .limit(20)
    .lean();

  if (!gigs.length) {
    throw new CustomException("No gigs found", 404);
  }

  const total = await gigModel.countDocuments(query);
  const totalPages = Math.ceil(total / 20);

  return res.status(200).json({
    error: false,
    message: "Gigs retrieved successfully",
    totalPages,
    totalResults: total,
    gigs,
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

module.exports = {
  getAllCategory,
  searchGig,
  getPopularCategories,
  getAllGig,
};
