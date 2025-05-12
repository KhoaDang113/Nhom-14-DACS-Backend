const paymentRouter = require("express").Router();
const {
  createPayment,
  getCheckPayment,
  getPaymentList,
} = require("../controllers/paymentController");
const authUser = require("../middlewares/authUser");
paymentRouter.post("/create", authUser, createPayment);
paymentRouter.get("/get-info", authUser, getCheckPayment);
paymentRouter.get("/get-list", authUser, getPaymentList);

module.exports = paymentRouter;
