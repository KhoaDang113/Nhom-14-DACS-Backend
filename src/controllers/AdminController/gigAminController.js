const { gigModel } = require("../../models");
const { CustomException, catchAsync, formatGigs } = require("../../utils");

const getAllGig = catchAsync(async (req, res) => {
  const gigs = await gigModel.find({ isDeleted: false }).lean();
  if (!gigs || gigs.length === 0) {
    throw new CustomException("No gigs found", 404);
  }
  const formattedGigs = await formatGigs(gigs);
  return res.status(200).json({
    error: false,
    message: "get gig successfully",
    gigs: formattedGigs,
  });
});

const getPendingGigs = catchAsync(async (req, res) => {
  const gigs = await gigModel
    .find({ status: "pending", isDeleted: false })
    .lean();
  if (!gigs || gigs.length === 0) {
    throw new CustomException("No gigs pending found, You are free", 404);
  }
  const formattedGigs = await formatGigs(gigs);
  return res.status(200).json({
    error: false,
    message: "get gig pending successfully",
    gigs: formattedGigs,
  });
});

const responseCreateGig = catchAsync(async (req, res) => {
  const { status } = req.body;
  const { idGig } = req.params;
  const gig = await gigModel
    .findById(idGig)
    .select("_id title status price duration freelancerId category_id media");
  if (!gig) throw new CustomException("gig not found", 404);

  const now = new Date();
  const userId = req.user._id;
  gig.status = status;
  if (status === "approved") {
    gig.approved_by = userId;
    gig.approved_at = now;
  } else if (status === "rejected") {
    gig.rejected_by = userId;
    gig.rejected_at = now;
  }

  await gig.save();
  return res.status(200).json({
    error: false,
    message: `Gig have been ${status}`,
    gig,
  });
});

const hideGig = catchAsync(async (req, res) => {
  const { idGig } = req.params;
  const gig = await gigModel
    .findById(idGig)
    .select(
      "_id title status price duration freelancerId category_id media isDeleted"
    );
  if (!gig) throw new CustomException("gig not found", 404);

  gig.isDeleted = !gig.isDeleted;

  await gig.save();
  return res.status(200).json({
    error: false,
    message: "hidden gig successfully",
    gig,
  });
});

const gethiddenGig = catchAsync(async (req, res) => {
  const hiddenGigs = await gigModel
    .find({ isDeleted: true })
    .select("_id title price media duration freelancerId category_id updatedAt")
    .lean();
  if (!hiddenGigs || hiddenGigs.length === 0) {
    throw new CustomException("No hidden gigs found", 404);
  }
  return res.status(200).json({
    error: false,
    message: "Hidden gigs retrieved successfully",
    gigs: hiddenGigs,
  });
});
module.exports = {
  getAllGig,
  getPendingGigs,
  gethiddenGig,
  responseCreateGig,
  hideGig,
};
