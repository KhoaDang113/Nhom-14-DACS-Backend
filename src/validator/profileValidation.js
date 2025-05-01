const { body } = require("express-validator");

const createFreelancerProfile = [
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isString()
    .withMessage("Full name must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Full name must be between 2 and 50 characters"),

  body("industry")
    .optional()
    .isString()
    .withMessage("Industry must be a string")
    .trim(),

  body("hardSkill")
    .optional()
    .isString()
    .withMessage("Hard skills must be a string")
    .trim(),

  body("softSkill")
    .optional()
    .isString()
    .withMessage("Soft skills must be a string")
    .trim(),

  body("languages")
    .optional()
    .isString()
    .withMessage("Languages must be a string")
    .trim(),

  body("country")
    .optional()
    .isString()
    .withMessage("Country must be a string")
    .trim(),

  body("education")
    .optional()
    .isString()
    .withMessage("Education must be a string")
    .trim(),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim(),

  body("certificates")
    .optional()
    .isString()
    .withMessage("Certificates must be a string")
    .trim(),
];

const updateFreelancerProfile = [
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isString()
    .withMessage("Full name must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Full name must be between 2 and 50 characters"),
  body("industry")
    .optional()
    .isString()
    .withMessage("Industry must be a string")
    .trim(),

  body("hardSkill")
    .optional()
    .isString()
    .withMessage("Hard skills must be a string")
    .trim(),

  body("softSkill")
    .optional()
    .isString()
    .withMessage("Soft skills must be a string")
    .trim(),

  body("languages")
    .optional()
    .isString()
    .withMessage("Languages must be a string")
    .trim(),

  body("country")
    .optional()
    .isString()
    .withMessage("Country must be a string")
    .trim(),

  body("education")
    .optional()
    .isString()
    .withMessage("Education must be a string")
    .trim(),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim(),

  body("certificates")
    .optional()
    .isString()
    .withMessage("Certificates must be a string")
    .trim(),
];
module.exports = {
  createFreelancerProfile,
  updateFreelancerProfile,
};
