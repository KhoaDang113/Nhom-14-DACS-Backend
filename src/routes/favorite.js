const favoriteRouter = require("express").Router();
const favoriteController = require("../controllers/favoriteController");
const authUser = require("../middlewares/authUser"); // thay thế 2 middleware cũ

favoriteRouter.post("/:idGig", authUser, favoriteController.isFavorite);

favoriteRouter.get("/get-list", authUser, favoriteController.getListFavorite);

module.exports = favoriteRouter;
