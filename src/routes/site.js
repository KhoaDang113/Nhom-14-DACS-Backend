const siteRouter = require("express").Router();
const siteController = require("../controllers/SiteController");

siteRouter.get("/api/category", siteController.getAllCategory);
siteRouter.get("/api/:idGig/get-gig-deatail", siteController.getDetailGig);
siteRouter.get("/api/search", siteController.searchGig);
siteRouter.get("/api/popular-categories", siteController.getPopularCategories);
siteRouter.get("/api/gigs", siteController.getAllGig);
siteRouter.get("/api/user/:userId", siteController.getUserById);

module.exports = siteRouter;
