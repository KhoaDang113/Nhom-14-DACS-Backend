const orderRouter = require("express").Router();
const orderController = require("../controllers/OrderController");
const authMiddleware = require("../middlewares/userMiddleware");

orderRouter.post(
  "/request-create/:idGig",
  authMiddleware,
  orderController.requestCreateOrder
);
orderRouter.post(
  "/response-request-create/:idOrder",
  authMiddleware,
  orderController.responseCreateOrder
);
orderRouter.post(
  "/request-cancel/:idOrder",
  authMiddleware,
  orderController.requestCancelOrder
);
orderRouter.post(
  "/response-request-cancel/:idCancelRequest",
  authMiddleware,
  orderController.responseCancelOrder
);
orderRouter.get("/get-list", authMiddleware, orderController.getListOrder);

module.exports = orderRouter;
