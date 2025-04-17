const { body } = require("express-validator");

const createGigValidator = [
  body("title").notEmpty().withMessage("Title is required"),

  body("description").notEmpty().withMessage("Description is required"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a number greater than 0")
    .toFloat(),

  body("duration")
    .notEmpty()
    .withMessage("Duration is required")
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1 day")
    .toInt(),

  body("category_id").notEmpty().withMessage("Category ID is required"),

  body("media")
    .notEmpty()
    .custom((value) => {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error("Media must be a non-empty array");
        }
        for (let item of parsed) {
          if (
            !item.type ||
            !["image", "video"].includes(item.type) ||
            !item.url ||
            typeof item.url !== "string"
          ) {
            throw new Error("Each media item must have a valid type and url");
          }
        }
        return true;
      } catch (err) {
        throw new Error("Media must be a valid JSON array with type and url");
      }
    }),
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

  body("media")
    .notEmpty()
    .custom((value) => {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error("Media must be a non-empty array");
        }
        for (let item of parsed) {
          if (
            !item.type ||
            !["image", "video"].includes(item.type) ||
            !item.url ||
            typeof item.url !== "string"
          ) {
            throw new Error("Each media item must have a valid type and url");
          }
        }
        return true;
      } catch (err) {
        throw new Error("Media must be a valid JSON array with type and url");
      }
    }),
  body("status").not().exists().withMessage("You cannot set status manually"),
];

module.exports = {
  createGigValidator,
  updateGigValidator,
};
