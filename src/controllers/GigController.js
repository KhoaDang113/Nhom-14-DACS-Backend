const { gigModel, orderModel } = require("../models");
const { CustomException, catchAsync } = require("../utils");

const createGig = catchAsync(async (req, res) => {
  const files = req.files || [];
  if (files.length === 0) throw new CustomException("Media is required", 400);

  const media = files.map((file) => ({
    type: file.mimetype.includes("video") ? "video" : "image",
    url: file.path,
  }));
  const gigData = { ...req.body, media, freelancerId: req.UserID };
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
      views: gig.views || 0,
      star: gig.star || 0,
      ratingsCount: gig.ratingsCount || 0,
      ordersCompleted: gig.ordersCompleted || 0,
    },
  });
});

const deleteGig = catchAsync(async (req, res) => {
  if (req.gig.isDeleted) {
    throw new CustomException("Gig already deleted", 400);
  }

  req.gig.isDeleted = true;
  await req.gig.save();

  res.send({ error: false, message: "Gig had been successfully deleted!" });
});

const getSingleGig = catchAsync(async (req, res) => {
  const gig = await gigModel
    .findById(req.params.id)
    .select(
      "_id title description category_id price media views ordersCompleted duration star ratingsCount createdAt updatedAt"
    );
  if (!gig) {
    throw new CustomException("Gig not found!", 404);
  }
  return res.status(200).json({ error: false, gig });
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
      "title description price media duration status category_id views ordersCompleted createdAt updatedAt star ratingsCount"
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
  let updatedMedia = [];
  if (req.body.existingImages) {
    const existingImages = Array.isArray(req.body.existingImages)
      ? req.body.existingImages
      : [req.body.existingImages];

    updatedMedia = existingImages.map((url) => ({
      type: "image",
      url: url,
    }));
  }
  const files = req.files;
  if (files && files.length > 0) {
    const newMedia = files.map((file) => ({
      type: file.mimetype.includes("video") ? "video" : "image",
      url: file.path,
    }));
    updatedMedia = [...updatedMedia, ...newMedia];
  }
  if (updatedMedia.length > 0) {
    req.body.media = updatedMedia;
  }
  delete req.body.existingImages;

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
  getSingleGig,
  getListGig,
  updateGig,
  hideGig,
};
