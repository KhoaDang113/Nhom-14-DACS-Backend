const express = require("express");
const dashboardAdminRouter = express.Router();
const dashboardController = require("../../controllers/AdminController/dashboardController");
const { roleMiddleware } = require("../../middlewares/roleMiddleware");
const authUser = require("../../middlewares/authUser");

dashboardAdminRouter.get(
  "/",
  authUser,
  roleMiddleware("admin"),
  dashboardController.getDashboardStats
);

module.exports = dashboardAdminRouter;
