const { body } = require("express-validator");

const createComplaint = [
  body("reason")
    .notEmpty()
    .withMessage("Complaint reason is required")
    .isIn([
      "dịch vụ bị cấm",
      "nội dung không phù hợp",
      "không nguyên bản",
      "vi phạm quyền sở hữu trí tuệ",
      "khác",
    ])
    .withMessage("Invalid complaint reason"),

  body("description")
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 255 })
    .withMessage("Description must less 255 characters long"),
];
module.exports = { createComplaint };
