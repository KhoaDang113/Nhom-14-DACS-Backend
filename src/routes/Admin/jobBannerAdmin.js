const jobBannerRouter = require("express").Router();
const jobBannerController = require("../../controllers/AdminController/jobBannerController");
const authUser = require("../../middlewares/authUser");
const validator = require("../../middlewares/validateMiddleware");
const { createJobBannerValidator } = require("../../validator/AdminJobBanner");
const uploadCloud = require("../../config/cloudinary");
const { roleMiddleware } = require("../../middlewares/roleMiddleware");

jobBannerRouter.post(
  "/create",
  authUser,
  roleMiddleware("admin"),
  uploadCloud.single("file"),
  validator(createJobBannerValidator),
  jobBannerController.createJobBanner
);

jobBannerRouter.get(
  "/get-list",
  authUser,
  roleMiddleware("admin"),
  jobBannerController.getListJobBanner
);

jobBannerRouter.put(
  "/update/:id",
  authUser,
  uploadCloud.single("file"),
  roleMiddleware("admin"),
  jobBannerController.updateJobBanner
);

jobBannerRouter.delete(
  "/delete/:id",
  authUser,
  roleMiddleware("admin"),
  jobBannerController.deletedJobBanner
);

jobBannerRouter.get(
  "/get/:id",
  authUser,
  roleMiddleware("admin"),
  jobBannerController.getJobBannerById
);

module.exports = jobBannerRouter;
