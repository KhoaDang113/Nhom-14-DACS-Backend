const gigRouter = require("express").Router();
const gigController = require("../controllers/GigController");

const authUser = require("../middlewares/authUser");
const authorizeGigOwner = require("../middlewares/authorizeGigOwner");
const {
  createGigValidator,
  updateGigValidator,
} = require("../validator/gigValidator");
const validate = require("../middlewares/validateMiddleware");
const { roleMiddleware } = require("../middlewares/roleMiddleware");

gigRouter.post(
  "/create",
  authUser,
  roleMiddleware("freelancer"),
  validate(createGigValidator),
  gigController.createGig
);

gigRouter.delete(
  "/delete/:id",
  authUser,
  roleMiddleware("freelancer"),
  authorizeGigOwner,
  gigController.deleteGig
);

gigRouter.get(
  "/get-list",
  authUser,
  roleMiddleware("freelancer"),
  gigController.getListGig
);

gigRouter.put(
  "/update/:id",
  authUser,
  roleMiddleware("freelancer"),
  authorizeGigOwner,
  validate(updateGigValidator),
  gigController.updateGig
);

gigRouter.patch(
  "/hidden/:id",
  authUser,
  roleMiddleware("freelancer"),
  authorizeGigOwner,
  gigController.hideGig
);

module.exports = gigRouter;
