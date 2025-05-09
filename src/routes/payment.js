const paymentRouter = require("express").Router();
const {
  createPayment,
  getCheckPayment,
} = require("../controllers/paymentController");
const authUser = require("../middlewares/authUser");
paymentRouter.post("/create", authUser, createPayment);
paymentRouter.get("/get-info", authUser, getCheckPayment);

module.exports = paymentRouter;
