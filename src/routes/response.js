const responseRouter = require("express").Router();
const responseController = require("../controllers/responseController");
const authUser = require("../middlewares/authUser");
const validate = require("../middlewares/validateMiddleware");
const { createRespone } = require("../validator/responeValidator");

responseRouter.post(
  "/:idReview/create",
  authUser,
  validate(createRespone),
  responseController.createRespone
);
// responseRouter.get("/:idGig/get", authUser, responseController.getAllresponse);

module.exports = responseRouter;
