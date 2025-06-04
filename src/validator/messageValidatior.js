const { body } = require("express-validator");

const createMessageValidator = [
  body("conversationId").notEmpty().withMessage("Conversation ID is required"),
  body("content").optional().isString().withMessage("Content must be a string"),

  body().custom((_, { req }) => {
    if (!req.body.content && !req.file) {
      throw new Error("Either content or attachment (file) is required");
    }

    // Nếu có file thì kiểm tra file hợp lệ (ví dụ file type)
    if (req.file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/bmp",

        // Tài liệu
        "application/pdf",
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/vnd.ms-excel", // .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "text/plain", // .txt
        "application/rtf", // .rtf
        "application/vnd.oasis.opendocument.text", // .odt
        "application/vnd.ms-powerpoint", // .ppt
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
        "video/mp4",
        "video/quicktime",
      ];

      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error("File type not supported");
      }
    }

    return true;
  }),
];

const getAllMessageValidator = [
  body("conversationId").notEmpty().withMessage("Conversation ID is required"),
];

module.exports = {
  createMessageValidator,
  getAllMessageValidator,
};
