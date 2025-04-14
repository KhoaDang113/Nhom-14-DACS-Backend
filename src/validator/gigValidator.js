const { body } = require("express-validator");

const createGigValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("price")
    .notEmpty()
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => value > 0)
    .withMessage("Price must be greater than 0"),
  body("duration")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1 day"),
  body("category_id").notEmpty().withMessage("Category ID is required"),
  body("media")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Media must be an array with at least one item"),
  body("status").not().exists().withMessage("You cannot set status manually"),
];

const updateGigValidator = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("Description cannot be empty"),
  body("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => value > 0)
    .withMessage("Price must be greater than 0"),
  body("duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1 day"),
  body("media").optional().isArray().withMessage("Media must be an array"),
  body("status").not().exists().withMessage("You cannot set status manually"),
];

module.exports = {
  createGigValidator,
  updateGigValidator,
};
