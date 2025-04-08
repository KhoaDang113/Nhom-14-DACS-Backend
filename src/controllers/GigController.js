const { gigModel, userModel, orderModel } = require("../models");

const { CustomException } = require("../utils");

const createGig = async (req, res) => {
  try {
    const user = await userModel.findOne({ clerkId: req.UserID });
    if (!user) {
      throw CustomException("User not found", 404);
    }
    if (user.role !== "freelancer") {
      throw CustomException("Only freelancers can create gigs", 403);
    }
    const gigData = {
      ...req.body,
      freelancerId: req.UserID,
    };
    const gig = new gigModel(gigData);
    await gig.save();
    return res.status(201).json({ message: "Gig created successfully", gig });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const deleteGig = async (req, res) => {
  try {
    const idGig = req.params.id;
    const gig = await gigModel.findById(idGig);
    const user = await userModel.findOne({ clerkId: req.UserID });

    if (user.role !== "freelancer") {
      throw CustomException("Only freelancers can delete gigs", 403);
    }
    if (!gig) {
      return res.status(200).json({ message: "Gig not found" });
    }
    if (req.UserID !== gig.freelancerId) {
      throw CustomException(
        "Invalid request! Cannot delete other user's gigs!",
        403
      );
    }
    await gigModel.deleteOne({ _id: idGig });
    return res.send({
      error: false,
      message: "Gig had been successfully deleted!",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Server error",
      error: error.message,
    });
  }
};

const getListGig = async (req, res) => {
  try {
    const user = await userModel.findOne({ clerkId: req.UserID });
    if (user.role !== "freelancer") {
      throw CustomException("Only freelancers can get their list gigs", 403);
    }
    let listGig = await gigModel
      .find({ freelancerId: req.UserID })
      .select(
        "title description price media duration status category_id createdAt updatedAt"
      );
    if (!listGig || listGig.length === 0) {
      return res.status(200).json({ message: "No gigs found" });
    }
    // console.log("List gigs:", listGig);

    return res.status(200).json({
      error: false,
      message: "Get list gigs successfully",
      listGig,
    });
  } catch (error) {
    return res.json(500, { message: "Server error", error: error.message });
  }
};

const updateGig = async (req, res) => {
  try {
    const idGig = req.params.id;
    const user = await userModel.findOne({ clerkId: req.UserID });
    if (user.role !== "freelancer") {
      throw CustomException("Only freelancers can get their list gigs", 403);
    }
    const gig = await gigModel.findById(idGig);
    if (!gig) {
      return res.status(200).json({ message: "Gig not found" });
    }
    if (req.UserID !== gig.freelancerId) {
      throw CustomException(
        "Invalid request! Cannot update other user's gigs!",
        403
      );
    }
    const updatedGig = await gigModel.findByIdAndUpdate(
      idGig,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    return res.status(200).json({
      error: false,
      message: "Gig updated successfully",
      gig: updatedGig,
    });
  } catch (error) {
    return res
      .status(500)
      .json(500, { message: "Server error", error: error.message });
  }
};

//check pre status to hidden
const getPreviousStatus = (gig) => {
  if (gig.approved_at && gig.rejected_at) {
    return gig.approved_at > gig.rejected_at ? "approved" : "rejected";
  }
  if (gig.approved_at) return "approved";
  if (gig.rejected_at) return "rejected";
  return "pending";
};

const hideGig = async (req, res) => {
  try {
    const idGig = req.params.id;
    const user = await userModel.findOne({ clerkId: req.UserID });
    const gig = await gigModel.findById(idGig);
    if (user.role !== "freelancer") {
      throw CustomException("Only freelancers can hide their gigs", 403);
    }
    if (!gig) {
      return res.status(200).json({ message: "Gig not found" });
    }
    console.log("req.UserID", req.UserID);
    console.log("gig.freelancerId", gig.freelancerId);

    if (req.UserID !== gig.freelancerId) {
      throw CustomException(
        "Invalid request! Cannot hide other user's gigs!",
        403
      );
    }
    const orderExists = await orderModel.findOne({ gigId: idGig });
    if (orderExists) {
      throw CustomException("Cannot hide gig with existing orders", 400);
    }
    let previousStatus = getPreviousStatus(idGig);
    let newStatus;
    let message;
    if (gig.status == "hidden") {
      newStatus = previousStatus;
      message = "Gig has been successfully unhidden";
    } else {
      newStatus = "hidden";
      message = "Gig has been successfully unhidden";
    }

    const updatedGig = await gigModel.findByIdAndUpdate(
      idGig,
      { $set: { status: newStatus } },
      { new: true }
    );

    return res.status(200).json({
      error: false,
      message: message,
      gig: updatedGig,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = { createGig, deleteGig, getListGig, updateGig, hideGig };
