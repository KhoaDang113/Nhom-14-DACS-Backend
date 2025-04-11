const gigAdminController = require("../../controllers/AdminController/gigAminController");
const RouterGigAdmin = require("express").Router();
const authUser = require("../../middlewares/authUser");
const { roleMiddleware } = require("../../middlewares/roleMiddleware");

RouterGigAdmin.get(
  "/pending",
  authUser,
  roleMiddleware("admin"),
  gigAdminController.getPendingGigs
);

module.exports = RouterGigAdmin;
