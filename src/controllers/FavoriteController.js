const { CustomException } = require("../utils");
const { gigModel, userModel, favoriteModel } = require("../models");

const isFavorite = async (req, res) => {
  try {
    const idGig = req.params.idGig;
    const gig = await gigModel.findById(idGig);
    if (!gig) throw CustomException("Gig not found", 404);
    const user = await userModel.findOne({ clerkId: req.UserID });
    if (!user) throw CustomException("User not found", 404);
    const favoriteData = {
      gigId: gig._id,
      customerId: user._id,
    };

    const isFavoriteBoolean = await favoriteModel.findOne(favoriteData);
    if (isFavoriteBoolean) {
      await favoriteModel.deleteOne(favoriteData);
      return res.status(200).json({
        error: false,
        message: "Favorite is removed successfully",
      });
    }
    const favorite = await favoriteModel(favoriteData);
    await favorite.save();
    return res.status(201).json({
      error: false,
      message: "Favorite is add successfully",
      favorite,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true });
  }
};

const getListFavorite = async (req, res) => {
  try {
    const user = await userModel.findOne({ clerkId: req.UserID });
    if (!user) throw CustomException("User not found", 404);
    const favorites = await favoriteModel
      .find({ customerId: user._id })
      .populate({
        path: "gigId",
      });
    return res.status(200).json({
      error: false,
      message: "Favorites retrieved successfully",
      favorites,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

module.exports = {
  isFavorite,
  getListFavorite,
};
