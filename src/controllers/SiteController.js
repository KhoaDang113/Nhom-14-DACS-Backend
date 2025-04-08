const { gigModel, categoryModel, orderModel } = require("../models");
const mongoose = require("mongoose");
const CustomException = require("../utils/CustomException");
const getAllCategory = async (req, res) => {
  try {
    const categories = await categoryModel
      .find({ parentCategory: null })
      .lean();

    const categoriesChildren = await Promise.all(
      categories.map(async (category) => {
        const subcategories = await categoryModel
          .find({ parentCategory: category._id })
          .lean();
        const subcategoriesWithChildren = await Promise.all(
          subcategories.map(async (subcategory) => {
            const subcategoryChildren = await categoryModel
              .find({ parentCategory: subcategory._id })
              .lean();
            return { ...subcategory, subcategoryChildren };
          })
        );

        return { ...category, subcategories: subcategoriesWithChildren };
      })
    );
    return res.json(categoriesChildren);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const searchGig = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice } = req.query;
    if (!keyword || typeof keyword !== "string") {
      throw CustomException("Missing or invalid keyword", 400);
    }
    const query = {
      $text: {
        $search: keyword,
      },
      status: "approved",
    };

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        throw CustomException(
          "Invalid categoryId format (it must be have 24 character)",
          400
        );
      }
      query.category_id = category;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (Number(minPrice) >= Number(maxPrice)) {
        return res.status(400).json({
          message: "The minimum price must be less than the maximum price",
        });
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
    const gigs = await gigModel
      .find(query, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
      .select(
        "_id title description keywords price media duration status category_id"
      )
      .lean();

    if (!gigs.length) {
      return res.status(404).json({ message: "No gigs found" });
    }
    return res.status(200).json({
      message: "Gigs retrieved successfully",
      gigs,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getAllGig = async (req, res) => {
  try {
    const gigs = await gigModel.find({ status: "approved" }).lean();
    if (!gigs || gigs.length === 0) {
      return res.status(200).json({ message: "No gigs found" });
    }
    return res.status(200).json({
      message: "Gigs retrieved successfully",
      gigs,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

//return top 10 categories based on the number of orders in the last 30 days
const getPopularCategories = async (req, res) => {
  try {
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
      return res.status(404).json({ message: "No orders found" });
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
      throw CustomException(
        "No popular categories found in the last 30 days",
        404
      );
    }

    return res.status(200).json({
      error: false,
      message: "Popular categories retrieved successfully",
      data: popularCategories,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAllCategory, searchGig, getPopularCategories, getAllGig };
