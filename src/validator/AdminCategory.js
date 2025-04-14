const { body } = require("express-validator");
const { categoryModel } = require("../models");
const mongoose = require("mongoose");
const createCategory = [
  body("categoryName").notEmpty().withMessage("category name is required"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description must be at most 255 characters"),

  body("parentCategory")
    .optional()
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid parentCategory ID");
      }
      const parentExists = await categoryModel.findById(value);
      if (!parentExists) {
        throw new Error("Parent category does not exist");
      }
      return true;
    }),
];

module.exports = { createCategory };
