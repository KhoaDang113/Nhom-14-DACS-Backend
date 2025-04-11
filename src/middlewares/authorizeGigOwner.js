const { gigModel } = require("../models");
const { CustomException, catchAsync } = require("../utils");
const authorizeGigOwner = catchAsync(async (req, res, next) => {
  const gig = await gigModel.findById({
    _id: req.params.id,
    isDeleted: false,
  });
  if (!gig) {
    return res.status(404).json({ message: "Gig not found" });
  }

  if (req.UserID !== gig.freelancerId) {
    throw new CustomException("You are not the owner of this gig", 403);
  }

  req.gig = gig; // attach gig để controller dùng
  next();
});

module.exports = authorizeGigOwner;
