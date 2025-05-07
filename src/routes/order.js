const orderRouter = require("express").Router();
const orderController = require("../controllers/orderController");
const authUser = require("../middlewares/authUser");
const validate = require("../middlewares/validateMiddleware");
const { roleMiddleware } = require("../middlewares/roleMiddleware");
const {
  requestCreateOrder,
  requestCancelOrder,
  responseCreateOrder,
  responseCancelOrder,
} = require("../validator/orderValidation");

orderRouter.post(
  "/request-create/:idGig",
  authUser,
  validate(requestCreateOrder),
  orderController.requestCreateOrder
);
orderRouter.post(
  "/response-request-create/:idOrder",
  authUser,
  roleMiddleware("freelancer"),
  validate(responseCreateOrder),
  orderController.responseCreateOrder
);
orderRouter.post(
  "/request-cancel/:idOrder",
  authUser,
  validate(requestCancelOrder),
  orderController.requestCancelOrder
);
orderRouter.post(
  "/response-request-cancel/:idCancelRequest",
  authUser,
  roleMiddleware("freelancer"),
  validate(responseCancelOrder),
  orderController.responseCancelOrder
);
orderRouter.post(
  "/completed/:idOrder",
  authUser,
  roleMiddleware("freelancer"),
  orderController.completeOrder
);
orderRouter.get(
  "/get-list-freelancer",
  authUser,
  orderController.getListOrderForFreelancer
);
orderRouter.get("/get-list", authUser, orderController.getListOrder);

module.exports = orderRouter;
