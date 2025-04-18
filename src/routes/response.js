const responseRouter = require("express").Router();
const responseController = require("../controllers/responseController");
const authUser = require("../middlewares/authUser");
const validate = require("../middlewares/validateMiddleware");
const { createRespone } = require("../validator/responeValidator");

responseRouter.post(
  "/create",
  authUser,
  validate(createRespone),
  responseController.createRespone
);

module.exports = responseRouter;
