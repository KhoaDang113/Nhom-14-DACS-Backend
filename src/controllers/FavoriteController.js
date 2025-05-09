const { CustomException } = require("../utils");
const { gigModel, favoriteModel, userModel } = require("../models");
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
  const favoriteList = await favoriteModel
    .find({ customerId: req.user._id })
    .populate({
      path: "gigId",
      select: "_id freelancerId title description price media categoryId",
      populate: {
        path: "freelancerId",
        select: "name avatar",
      },
    })
    .select("_id gigId customerId");
  const favorites = await Promise.all(
    favoriteList.map(async (favorite) => {
      const user = await userModel.findOne({
        clerkId: favorite.gigId.freelancerId,
      });
      return {
        _id: favorite.gigId._id,
        title: favorite.gigId.title,
        description: favorite.gigId.description,
        price: favorite.gigId.price,
        media: favorite.gigId.media,
        categoryId: favorite.gigId.categoryId,
        freelancer: {
          _id: favorite.gigId.freelancerId,
          name: user?.name,
          avatar: user?.avatar,
        },
      };
    })
  );
  console.log(favorites);

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
