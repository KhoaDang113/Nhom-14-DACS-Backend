const gigAdminController = require("../../controllers/AdminController/gigAminController");
const RouterGigAdmin = require("express").Router();
const authUser = require("../../middlewares/authUser");
const { roleMiddleware } = require("../../middlewares/roleMiddleware");
const validate = require("../../middlewares/validateMiddleware");
const { responseCreate } = require("../../validator/AdminGig");
RouterGigAdmin.get(
  "/pending",
  authUser,
  roleMiddleware("admin"),
  gigAdminController.getPendingGigs
);
RouterGigAdmin.put(
  "/:idGig/response-create",
  authUser,
  roleMiddleware("admin"),
  validate(responseCreate),
  gigAdminController.responseCreateGig
);

RouterGigAdmin.put(
  "/:idGig/hide",
  authUser,
  roleMiddleware("admin"),
  gigAdminController.hideGig
);

RouterGigAdmin.get(
  "/hidden-gig",
  authUser,
  roleMiddleware("admin"),
  gigAdminController.gethiddenGig
);
RouterGigAdmin.get(
  "/get",
  authUser,
  roleMiddleware("admin"),
  gigAdminController.getAllGig
);

module.exports = RouterGigAdmin;
