const categoryController = require("../../controllers/AdminController/categoryController");
const authUser = require("../../middlewares/authUser");
const { roleMiddleware } = require("../../middlewares/roleMiddleware");
const validate = require("../../middlewares/validateMiddleware");
const categoryRouter = require("express").Router();
const { createCategory } = require("../../validator/AdminCategory");
categoryRouter.get(
  "/get",
  authUser,
  roleMiddleware("admin"),
  categoryController.getAllCategory
);
categoryRouter.post(
  "/create",
  authUser,
  roleMiddleware("admin"),
  validate(createCategory),
  categoryController.createCategory
);
categoryRouter.put(
  "/:idCategory/update",
  authUser,
  roleMiddleware("admin"),
  validate(createCategory),
  categoryController.updateCategory
);
categoryRouter.delete(
  "/:idCategory/delete",
  authUser,
  roleMiddleware("admin"),
  categoryController.deleteCategory
);

module.exports = categoryRouter;
