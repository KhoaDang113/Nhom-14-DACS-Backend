const { response } = require("express");
const {
  gigModel,
  orderModel,
  userModel,
  cancelRequestModel,
} = require("../models");
const { CustomException } = require("../utils");
// const path = require("path");
// const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix);
//   },
// });
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: function (req, file, cb) {
//     const filetypes = /jpeg|jpg|png|gif/;
//     const mimetype = filetypes.test(file.mimetype);
//     const extname = filetypes.test(
//       path.extname(file.originalname).toLowerCase()
//     );
//     if (mimetype && extname) {
//       return cb(null, true);
//     }
//     cb(
//       "Error: File upload only supports the following filetypes - " + filetypes
//     );
//   },
// }).array("attachments", 5);

const requestCreateOrder = async (req, res) => {
  try {
    //check gig and user are exist
    const idGig = req.params.idGig;
    const gig = await gigModel.findById(idGig);
    if (!gig) throw CustomException("Gig not found", 404);
    const user = await userModel.findOne({ clerkId: req.UserID });
    if (!user) throw CustomException("User not found", 404);

    //check gig is approved
    if (gig.status !== "approved") {
      throw CustomException("Gig is not available for ordering", 400);
    }

    //check user is freelancer or not
    const freelancer = await userModel.findOne({ clerkId: gig.freelancerId });
    if (!freelancer) {
      throw CustomException("Freelancer not found", 404);
    }
    if (freelancer.role !== "freelancer") {
      throw CustomException("Freelancer not found", 400);
    }
    if (user._id === freelancer._id) {
      throw CustomException("You cannot order your own gig", 400);
    }
    const { requirements } = req.body;
    if (!requirements)
      throw CustomException("Missing required field: requirements", 400);
    // const attachments = req.files ? req.files.map((file) => file.path) : [];

    const orderData = {
      gigId: gig._id,
      customerId: user._id,
      freelancerId: freelancer.clerkId,
      title: gig.title,
      media: gig.media,
      requirements,
      price: gig.price,
      //attachments,
    };
    const order = new orderModel(orderData);
    await order.save();
    return res.status(201).json({
      error: false,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const responseCreateOrder = async (req, res) => {
  try {
    const user = await userModel.findOne({ clerkId: req.UserID });
    if (user.role !== "freelancer") {
      throw CustomException("Only freelancers can respond to orders", 403);
    }
    const order = await orderModel.findById(req.params.idOrder);
    if (!order) {
      throw CustomException("Order not found", 404);
    }
    if (req.UserID !== order.freelancerId) {
      throw CustomException(
        "You are not authorized to respond to this order",
        403
      );
    }

    const response = req.body.response;
    if (!response) {
      throw CustomException("Missing required field: response", 400);
    }
    if (response !== "approve" && response !== "reject") {
      throw CustomException("Invalid response", 400);
    }
    const statusMap = {
      approve: "approved",
      reject: "rejected",
    };

    if (statusMap[response]) {
      order.status = statusMap[response];
    }
    await order.save();
    return res.status(200).json({
      error: false,
      message: `Order ${response}d successfully`,
      order,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true });
  }
};

const getListOrder = async (req, res) => {
  try {
    const user = await userModel.findOne({ clerkId: req.UserID });
    if (!user) throw CustomException("User not found", 404);
    const orders = await orderModel.find({ customerId: user._id });
    return res.status(200).json({
      error: false,
      message: "Get list order successfully",
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const requestCancelOrder = async (req, res) => {
  try {
    const idOrder = req.params.idOrder;
    const order = await orderModel.findById(idOrder);
    if (!order) throw CustomException("Order not found", 404);
    const user = await userModel.findOne({ clerkId: req.UserID });

    if (user._id.toString() !== order.customerId.toString()) {
      throw CustomException("You cannot cancel orther user's order", 400);
    }

    if (order.status == "completed" || order.status === "canceled") {
      throw CustomException(`Order is already ${order.status} `, 400);
    }
    const cancelOrderRequest = await cancelRequestModel.findOne({
      orderId: order._id,
    });
    if (cancelOrderRequest) {
      throw CustomException(
        "You have already sent a cancel request for this order"
      );
    }
    //incase pending order will be canceled
    if (order.status == "pending") {
      order.status = "canceled";
      const cancleRequirest = new cancelRequestModel({
        orderId: order._id,
        reason: req.body.reason || "Cancelled by customer before acceptance",
        status: "approved",
      });

      await cancleRequirest.save();
      order.cancelRequestId = cancleRequirest._id;
      await order.save();
      return res.status(200).json({
        error: false,
        message: "Order canceled successfully",
        order,
      });
    }

    //incase in_progress order have to check
    if (order.status == "approved") {
      const cancleRequirest = new cancelRequestModel({
        orderId: order._id,
        reason: req.body.reason || "Customer requested cancellation",
        status: "pending",
      });
      await cancleRequirest.save();
      order.cancelRequestId = cancleRequirest._id;
      await order.save();
      return res.status(200).json({
        error: false,
        message:
          "Cancellation request sent successfully. Waiting for freelancer response.",
        order,
      });
    }
    return res.status(400).json({
      error: true,
      message: "Invalid order status",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const responseCancelOrder = async (req, res) => {
  try {
    const idCancelRequest = req.params.idCancelRequest;
    // console.log("idCancelRequest", idCancelRequest);

    const user = await userModel.findOne({ clerkId: req.UserID });
    if (user.role !== "freelancer") {
      throw CustomException(
        "You are not authorized to respond to this request",
        403
      );
    }

    const cancelRequest = await cancelRequestModel
      .findById(idCancelRequest)
      .populate("orderId");
    if (!cancelRequest) {
      throw CustomException("Cancel request not found", 404);
    }
    const order = cancelRequest.orderId;
    if (order.freelancerId !== user.clerkId) {
      throw CustomException(
        "You are not authorized to respond to this request",
        403
      );
    }
    const response = req.body.response;
    if (!response) {
      throw CustomException("Missing required field: response", 400);
    }
    if (response !== "approve" && response !== "reject") {
      throw CustomException("Invalid response", 400);
    }
    if (response === "approve") {
      cancelRequest.status = "approved";
      order.status = "canceled";
      await cancelRequest.save();
      await order.save();
      return res.status(200).json({
        error: false,
        message: "Cancel request approved. Order has been canceled.",
      });
    }
    if (response === "reject") {
      cancelRequest.status = "rejected";
      order.status = "canceled";
      await cancelRequest.save();
      await order.save();
      return res.status(200).json({
        error: false,
        message: "Cancel request rejected.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = {
  requestCreateOrder,
  responseCreateOrder,
  getListOrder,
  requestCancelOrder,
  responseCancelOrder,
};
