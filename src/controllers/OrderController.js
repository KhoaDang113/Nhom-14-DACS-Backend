const {
  gigModel,
  orderModel,
  userModel,
  cancelRequestModel,
  reviewModel, // Thêm import reviewModel
} = require("../models");
const { CustomException, catchAsync } = require("../utils");

const requestCreateOrder = catchAsync(async (req, res) => {
  const { idGig } = req.params;
  const { requirements } = req.body;
  const gig = await gigModel.findOne({ _id: idGig, isDeleted: false });
  if (!gig) throw new CustomException("Gig not found", 404);

  if (gig.status !== "approved" || gig.isDeleted === true) {
    throw new CustomException("Gig is not available for ordering", 400);
  }

  const customer = req.user; // đã có từ authMiddleware
  const freelancer = await userModel.findOne({ clerkId: gig.freelancerId });
  if (!freelancer || freelancer.role !== "freelancer") {
    throw new CustomException("Freelancer not found", 404);
  }

  if (customer._id.equals(freelancer._id)) {
    throw new CustomException("You cannot order your own gig", 400);
  }

  const orderData = {
    gigId: gig._id,
    customerId: customer._id,
    freelancerId: freelancer.clerkId,
    title: gig.title,
    media: gig.media,
    requirements,
    price: gig.price,
  };

  const order = await orderModel.create(orderData);
  res.status(201).json({
    error: false,
    message: "Order created successfully",
    order: {
      _id: order._id,
      title: order.title,
      gigId: order.gigId,
      freelancerId: order.freelancerId,
      price: order.price,
      status: order.status,
      createdAt: order.createdAt,
    },
  });
});

const responseCreateOrder = catchAsync(async (req, res) => {
  const order = await orderModel.findById(req.params.idOrder);
  if (!order) {
    throw new CustomException("Order not found", 404);
  }
  if (req.UserID !== order.freelancerId) {
    throw new CustomException(
      "You are not authorized to respond to this order",
      403
    );
  }

  const response = req.body.response;

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
    order: {
      _id: order._id,
      status: order.status,
      updatedAt: order.updatedAt,
    },
  });
});

const getListOrderForFreelancer = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const totalOrders = await orderModel.countDocuments({
    freelancerId: req.UserID,
  });
  const totalPages = Math.ceil(totalOrders / limit);

  const orders = await orderModel
    .find({ freelancerId: req.UserID })
    .populate("gigId", "price")
    .populate("customerId", "name")
    .select("_id title price status createdAt")
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    error: false,
    message: "Get list order successfully",
    orders,
    pagination: {
      currentPage: page,
      totalPages,
      totalOrders,
      ordersPerPage: limit,
    },
  });
});

const getListOrder = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const totalOrders = await orderModel.countDocuments({
    customerId: req.user._id,
  });
  const totalPages = Math.ceil(totalOrders / limit);

  const orders = await orderModel
    .find({ customerId: req.user._id })
    .select("_id title price status createdAt")
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    error: false,
    message: "Get list order successfully",
    orders,
    pagination: {
      currentPage: page,
      totalPages,
      totalOrders,
      ordersPerPage: limit,
    },
  });
});

const requestCancelOrder = catchAsync(async (req, res) => {
  const idOrder = req.params.idOrder;
  const order = await orderModel.findById(idOrder);
  if (!order) throw new CustomException("Order not found", 404);
  if (req.user._id.toString() !== order.customerId.toString()) {
    throw new CustomException("You cannot cancel orther user's order", 400);
  }

  if (order.status == "completed" || order.status === "canceled") {
    throw new CustomException(`Order is already ${order.status} `, 400);
  }
  const cancelOrderRequest = await cancelRequestModel.findOne({
    orderId: order._id,
  });
  if (cancelOrderRequest) {
    throw new CustomException(
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
      order: {
        _id: order._id,
        status: order.status,
        cancelRequestId: order.cancelRequestId,
        updatedAt: order.updatedAt,
      },
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
      order: {
        _id: order._id,
        status: order.status,
        cancelRequestId: order.cancelRequestId,
        updatedAt: order.updatedAt,
      },
    });
  }
  return res.status(400).json({
    error: true,
    message: "Invalid order status",
  });
});

const responseCancelOrder = catchAsync(async (req, res) => {
  const idCancelRequest = req.params.idCancelRequest;
  const cancelRequest = await cancelRequestModel
    .findById(idCancelRequest)
    .populate("orderId");
  if (!cancelRequest) {
    throw new CustomException("Cancel request not found", 404);
  }
  const order = cancelRequest.orderId;
  if (order.freelancerId !== req.user.clerkId) {
    throw new CustomException(
      "You are not authorized to respond to this request",
      403
    );
  }
  const response = req.body.response;
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
});

const completeOrder = catchAsync(async (req, res) => {
  const orderId = req.params.idOrder;
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw new CustomException("Order not found", 404);
  }
  if (order.freelancerId !== req.UserID) {
    throw new CustomException(
      "You are not authorized to respond to this request",
      403
    );
  }

  if (order.status === "completed") {
    throw new CustomException("Order is already completed", 400);
  }
  order.status = "completed";
  await order.save();
  await gigModel.updateOne(
    { _id: order.gigId },
    { $inc: { ordersCompleted: 1 } }
  );
  res.status(200).json({
    success: true,
    message: "Order completed successfully",
    order: {
      _id: order._id,
      gigId: order.gigId,
      status: order.status,
    },
  });
});

// add
const getOrderById = catchAsync(async (req, res) => {
  const { orderId } = req.params;

  // Find the order with populated references
  const order = await orderModel
    .findById(orderId)
    .populate("gigId", "title price media duration")
    .populate("customerId", "name email avatar")
    .lean();

  if (!order) {
    throw new CustomException("Order not found", 404);
  }

  // Check if the user is authorized to view this order
  // Allow both the customer and the freelancer to view the order
  if (
    req.user._id.toString() !== order.customerId._id.toString() &&
    req.UserID !== order.freelancerId
  ) {
    throw new CustomException("You are not authorized to view this order", 403);
  }

  // Get freelancer details
  const freelancer = await userModel
    .findOne({ clerkId: order.freelancerId })
    .select("name avatar _id")
    .lean();

  // Enhance order object with freelancer details
  const enhancedOrder = {
    ...order,
    freelancerInfo: {
      name: freelancer?.name || "Người bán",
      avatar:
        freelancer?.avatar || "https://randomuser.me/api/portraits/men/42.jpg",
      _id: freelancer?._id || null,
    },
  };

  return res.status(200).json({
    error: false,
    message: "Order retrieved successfully",
    order: enhancedOrder,
  });
});

const getCustomerOrders = catchAsync(async (req, res) => {
  const customerId = req.user._id;
  const pageOptions = {
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 10,
  };

  try {
    const skip = (pageOptions.page - 1) * pageOptions.limit;

    // Lấy danh sách đơn hàng
    const query = { customerId };

    const [orders, totalOrders] = await Promise.all([
      orderModel
        .find(query)
        .populate("gigId", "title price")
        .populate("freelancerId", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageOptions.limit)
        .lean(),
      orderModel.countDocuments(query),
    ]);

    // Lấy thông tin review cho mỗi đơn hàng
    const orderIds = orders.map((order) => order._id);
    const reviews = await reviewModel
      .find({
        orderId: { $in: orderIds },
      })
      .select("_id orderId gigId")
      .lean();

    // Map thông tin reviews vào orders
    const ordersWithReviewInfo = orders.map((order) => {
      const review = reviews.find(
        (r) => r.orderId && r.orderId.toString() === order._id.toString()
      );

      return {
        ...order,
        isReviewed: !!review,
        reviewId: review ? review._id : null,
      };
    });

    res.status(200).json({
      error: false,
      message: "Lấy danh sách đơn hàng thành công",
      orders: ordersWithReviewInfo,
      pagination: {
        currentPage: pageOptions.page,
        totalPages: Math.ceil(totalOrders / pageOptions.limit),
        totalOrders: totalOrders,
        ordersPerPage: pageOptions.limit,
      },
    });
  } catch (error) {
    throw error;
  }
});

//add
module.exports = {
  requestCreateOrder,
  responseCreateOrder,
  getListOrderForFreelancer,
  getListOrder,
  requestCancelOrder,
  responseCancelOrder,
  completeOrder,
  getOrderById,
  getCustomerOrders,
};
