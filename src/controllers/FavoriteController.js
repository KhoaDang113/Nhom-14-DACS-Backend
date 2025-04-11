const { CustomException } = require("../utils");
const { gigModel, favoriteModel } = require("../models");
const catchAsync = require("../utils/CatchAsync");

const isFavorite = catchAsync(async (req, res) => {
  const { idGig } = req.params;

  const gig = await gigModel.findOne({ _id: idGig, isDeleted: false });
  if (!gig) throw new CustomException("Gig not found", 404);

  const favoriteData = {
    gigId: gig._id,
    customerId: req.user._id,
  };

  const isFavoriteBoolean = await favoriteModel.findOne(favoriteData);

  if (isFavoriteBoolean) {
    await favoriteModel.deleteOne(favoriteData);
    return res.status(200).json({
      error: false,
      isFavorite: false,
      message: "Favorite is removed successfully",
    });
  }

  const favorite = await new favoriteModel(favoriteData).save();

  return res.status(201).json({
    error: false,
    message: "Favorite is added successfully",
    isFavorite: true,
    favorite: {
      _id: favorite._id,
      gigId: favorite.gigId,
    },
  });
});

const getListFavorite = catchAsync(async (req, res) => {
  const favorites = await favoriteModel
    .find({ customerId: req.user._id })
    .populate("gigId", "_id freelancerId title")
    .select("_id gigId customerId");

  return res.status(200).json({
    error: false,
    message: "Favorites retrieved successfully",
    favorites,
  });
});

module.exports = {
  isFavorite,
  getListFavorite,
};
