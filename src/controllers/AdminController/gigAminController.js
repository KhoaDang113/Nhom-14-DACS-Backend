const { gigModel } = require("../../models");
const { CustomException, catchAsync, formatGigs } = require("../../utils");

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
  status === "approved" ? (gig.status = "approved") : (gig.status = "rejected");
  await gig.save();
  return res.status(200).json({
    error: false,
    message: `Gig have been ${status}`,
    gig,
  });
});

module.exports = { getPendingGigs, responseCreateGig };
