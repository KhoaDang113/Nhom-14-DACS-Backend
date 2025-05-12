const responseRouter = require("express").Router();
const responseController = require("../controllers/responseController");
const authUser = require("../middlewares/authUser");
const validate = require("../middlewares/validateMiddleware");
const { createRespone, getRespone } = require("../validator/responeValidator");

module.exports = (io) => {
  responseRouter.use((req, res, next) => {
    req.io = io;
    next();
  });
  responseRouter.post(
    "/create",
    authUser,
    validate(createRespone),
    responseController.createRespone
  );

  responseRouter.get(
    "/get/:idReview",
    authUser,
    validate(getRespone),
    responseController.getRespone
  );
  return responseRouter;
};
