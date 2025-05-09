const responseRouter = require("express").Router();
const responseController = require("../controllers/responseController");
const authUser = require("../middlewares/authUser");
const validate = require("../middlewares/validateMiddleware");
const { createRespone, getRespone } = require("../validator/responeValidator");

responseRouter.post(
  "/create",
  authUser,
  validate(createRespone),
  responseController.createRespone
);

responseRouter.get(
  "/get",
  authUser,
  validate(getRespone),
  responseController.getRespone
);

module.exports = responseRouter;
