const gigRouter = require("express").Router();
const gitController = require("../controllers/GigController");
const userMiddleware = require("../middlewares/userMiddleware");

gigRouter.post("/create", userMiddleware, gitController.createGig);
gigRouter.delete("/delete/:id", userMiddleware, gitController.deleteGig);
gigRouter.get("/get-list", userMiddleware, gitController.getListGig);
gigRouter.put("/update/:id", userMiddleware, gitController.updateGig);
gigRouter.patch("/hidden/:id", userMiddleware, gitController.hideGig);

module.exports = gigRouter;
