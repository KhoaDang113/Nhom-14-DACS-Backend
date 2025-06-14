const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "bmp",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "txt",
  ],
  params: async (req, file) => {
    return {
      folder: "WebJobViet",
      resource_type: "auto",
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;
