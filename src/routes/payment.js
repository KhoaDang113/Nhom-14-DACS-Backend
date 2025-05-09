const paymentRouter = require("express").Router();
const { createPayment } = require("../controllers/paymentController");

paymentRouter.post("/create", createPayment);

module.exports = paymentRouter;
