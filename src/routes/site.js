const siteRouter = require("express").Router();
const siteController = require("../controllers/siteController");

siteRouter.get("/api/category", siteController.getAllCategory);
siteRouter.get("/api/:idGig/get-gig-detail", siteController.getDetailGig);
siteRouter.get("/api/search", siteController.searchGig);
siteRouter.get("/api/popular-categories", siteController.getPopularCategories);
siteRouter.get("/api/gigs", siteController.getAllGig);
siteRouter.get("/api/user/:userId", siteController.getUserById);
siteRouter.get(
  "/api/gigs-category/:categoryId",
  siteController.getGigsByCategory
);
siteRouter.get("/api/list-banner", siteController.getListJobBanner);
siteRouter.get("/api/list-job-hot", siteController.getListJobHots);

module.exports = siteRouter;
