const favoriteRouter = require("express").Router();
const favoriteController = require("../controllers/FavoriteController");
const userMiddleware = require("../middlewares/userMiddleware");

favoriteRouter.post("/:idGig", userMiddleware, favoriteController.isFavorite);
favoriteRouter.get(
  "/get-list",
  userMiddleware,
  favoriteController.getListFavorite
);

module.exports = favoriteRouter;
