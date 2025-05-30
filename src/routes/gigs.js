const gigRouter = require("express").Router();
const gigController = require("../controllers/gigController");
const uploadCloud = require("../config/cloudinary");
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
  uploadCloud.array("files", 5),
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
gigRouter.get(
  "/:id/get-single-gig",
  authUser,
  roleMiddleware("freelancer"),
  authorizeGigOwner,
  gigController.getSingleGig
);

gigRouter.put(
  "/update/:id",
  authUser,
  roleMiddleware("freelancer"),
  authorizeGigOwner,
  uploadCloud.array("files", 5),
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
