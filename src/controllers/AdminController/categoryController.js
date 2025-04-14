const { categoryModel, gigModel } = require("../../models");
const { catchAsync, CustomException, formatGig } = require("../../utils");

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

const createCategory = catchAsync(async (req, res) => {
  const { categoryName, description, parentCategory } = req.body;
  const existCategory = await categoryModel.findOne({
    name: categoryName,
    parentCategory: parentCategory || null,
    isDeleted: false,
  });

  if (existCategory) throw new CustomException("Category already exists", 400);

  const categorydata = {
    name: categoryName,
    description,
    parentCategory: parentCategory || null,
    adminId: req.user._id,
  };
  const newCategory = new categoryModel(categorydata);
  await newCategory.save();
  const responseData = await categoryModel
    .findById(newCategory._id)
    .select(
      "_id name description slug parentCategory adminId createdAt updatedAt"
    )
    .lean();

  return res.status(201).json({
    error: false,
    message: "Category created successfully",
    responseData,
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const { idCategory } = req.params;
  const { categoryName, description, parentCategory } = req.body;

  const category = await categoryModel
    .findById(idCategory)
    .select("name description slug isDeleted parentCategory adminId ");
  if (!category || category.isDeleted) {
    throw new CustomException("Category not found", 404);
  }

  if (categoryName && categoryName !== category.name) {
    category.name = categoryName;
    category.slug = categoryName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  }

  if (description !== undefined) category.description = description;
  if (parentCategory !== undefined) category.parentCategory = parentCategory;

  await category.save();

  res.status(200).json({
    error: false,
    message: "Category updated successfully",
    category,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const { idCategory } = req.params;
  const category = await categoryModel
    .findById(idCategory)
    .select("name description slug isDeleted parentCategory adminId ");
  if (!category || category.isDeleted) {
    throw new CustomException("Category not found", 404);
  }
  category.isDeleted = true;
  await category.save();
  return res.status(200).json({
    error: false,
    message: "Category deleted",
    category,
  });
});
module.exports = {
  getAllCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
