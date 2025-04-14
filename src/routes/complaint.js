const complaintController = require("../controllers/complaintController");
const complaintRouter = require("express").Router();
const authUser = require("../middlewares/authUser");
const { createComplaint } = require("../validator/complaintValidator");
const validate = require("../middlewares/validateMiddleware");

complaintRouter.post(
  "/:idGig/create",
  authUser,
  validate(createComplaint),
  complaintController.createComplaint
);

module.exports = complaintRouter;
