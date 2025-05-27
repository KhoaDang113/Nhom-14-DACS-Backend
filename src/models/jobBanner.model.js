const mongoose = require("mongoose");
const jobBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    cta: {
      type: String,
      required: true,
    },
    ctaLink: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobBanner", jobBannerSchema);
