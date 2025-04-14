const catchAsync = require("../utils/CatchAsync");
const { gigModel, orderModel } = require("../models");

const { CustomException } = require("../utils");

const createGig = catchAsync(async (req, res) => {
  const gigData = { ...req.body, freelancerId: req.UserID };
  const gig = await new gigModel(gigData).save();
  delete req.body.status;
  res.status(201).json({
    message: "Gig created successfully",
    gig: {
      _id: gig._id,
      title: gig.title,
      price: gig.price,
      media: gig.media,
      duration: gig.duration,
      category_id: gig.category_id,
      status: gig.status,
    },
  });
});

const deleteGig = catchAsync(async (req, res) => {
  console.log("gig:", req.gig);

  if (req.gig.isDeleted) {
    throw new CustomException("Gig already deleted", 400);
  }

  req.gig.isDeleted = true;
  await req.gig.save();

  res.send({ error: false, message: "Gig had been successfully deleted!" });
});

const getListGig = catchAsync(async (req, res) => {
  const { page = 1 } = req.query;

  const query = {
    freelancerId: req.UserID,
    isDeleted: false,
  };

  const gigs = await gigModel
    .find(query)
    .select(
      "title description price media duration status category_id createdAt updatedAt"
    )
    .skip((page - 1) * 10)
    .limit(Number(10))
    .sort({ createdAt: -1 })
    .lean();

  const total = await gigModel.countDocuments(query);
  const totalPages = Math.ceil(total / 10);

  return res.status(200).json({
    error: false,
    message: gigs.length ? "Gigs retrieved successfully" : "No gigs found",
    pagination: {
      currentPage: Number(page),
      totalPages,
      totalResults: total,
    },
    gigs,
  });
});

const updateGig = catchAsync(async (req, res) => {
  delete req.body.status;
  const updatedGig = await gigModel
    .findOneAndUpdate(
      { _id: req.gig._id, isDeleted: false },
      { $set: req.body },
      { new: true, runValidators: true }
    )
    .select(
      "title description price media duration status category_id updatedAt"
    );
  res.status(200).json({
    error: false,
    message: "Gig updated successfully",
    gig: updatedGig,
  });
});

const getPreviousStatus = (gig) => {
  if (gig.approved_at && gig.rejected_at) {
    return gig.approved_at > gig.rejected_at ? "approved" : "rejected";
  }
  if (gig.approved_at) return "approved";
  if (gig.rejected_at) return "rejected";
  return "pending";
};

const hideGig = catchAsync(async (req, res) => {
  const gig = req.gig;

  const orderExists = await orderModel.findOne({ gigId: gig._id });
  if (orderExists)
    throw new CustomException("Cannot hide gig with existing orders", 400);

  const previousStatus = getPreviousStatus(gig);
  const isHidden = gig.status === "hidden";

  const newStatus = isHidden ? previousStatus : "hidden";
  const message = isHidden
    ? "Gig has been successfully unhidden"
    : "Gig has been successfully hidden";

  const updatedGig = await gigModel
    .findByIdAndUpdate(gig._id, { $set: { status: newStatus } }, { new: true })
    .select("title status previousStatus updatedAt");

  res.status(200).json({ error: false, message, gig: updatedGig });
});

module.exports = {
  createGig,
  deleteGig,
  getListGig,
  updateGig,
  hideGig,
};
