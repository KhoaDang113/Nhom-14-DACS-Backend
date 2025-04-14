const complaintController = require("../../controllers/AdminController/complainController");
const complaintRouter = require("express").Router();
const authUser = require("../../middlewares/authUser");
const { roleMiddleware } = require("../../middlewares/roleMiddleware");
const validate = require("../../middlewares/validateMiddleware");
const { handleComplaint } = require("../../validator/AdminComplaint");
complaintRouter.get(
  "/get",
  authUser,
  roleMiddleware("admin"),
  complaintController.getAllComplaints
);
complaintRouter.get(
  "/:idComplaint/get",
  authUser,
  roleMiddleware("admin"),
  complaintController.getComplaintDetail
);
complaintRouter.put(
  "/:idComplaint/handle-complaint",
  authUser,
  roleMiddleware("admin"),
  validate(handleComplaint),
  complaintController.handleComplaint
);

module.exports = complaintRouter;
