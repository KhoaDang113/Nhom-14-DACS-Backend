const { CustomException, catchAsync } = require("../utils");
const { transactionModel, orderModel, gigModel } = require("../models");
const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");

const createPayment = catchAsync(async (req, res, next) => {
  const { amount, orderId, requirements, gigId } = req.body;
  if (!amount || !orderId) {
    return next(new CustomException("Missing required fields", 400));
  }
  await transactionModel.create({
    orderId,
    gigId,
    amount,
    requirements: requirements || "", // Lưu requirements nếu có
    userId: req.user._id, // Lấy từ authMiddleware
    status: "pending",
    createdAt: new Date(),
  });
  const vnpay = new VNPay({
    // Thông tin cấu hình bắt buộc
    tmnCode: "3GXJWD3X",
    secureSecret: "UWYAL1JTMTQBJB7Y1QWGNLCR195D8DNX",
    vnpayHost: "https://sandbox.vnpayment.vn",

    // Cấu hình tùy chọn
    testMode: true, // Chế độ test
    hashAlgorithm: "SHA512", // Thuật toán mã hóa
    enableLog: true, // Bật/tắt ghi log
    loggerFn: ignoreLogger, // Hàm xử lý log tùy chỉnh
  });

  const vnpayResponse = vnpay.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr: "127.0.0.1",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}`,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: "http://localhost:5000/api/payment/get-info",
    vnp_Locale: VnpLocale.VN, // Ngôn ngữ hiển thị
    vnp_CreateDate: dateFormat(new Date(), "yyyyMMddHHmmss"), // Thời gian tạo giao dịch
    vnp_ExpireDate: dateFormat(
      new Date(new Date().getTime() + 30 * 60 * 1000),
      "yyyyMMddHHmmss"
    ), // Thời gian hết hạn giao dịch
  });

  res.status(200).json(vnpayResponse);
});

const getCheckPayment = catchAsync(async (req, res, next) => {
  const vnpay = new VNPay({
    tmnCode: "3GXJWD3X",
    secureSecret: "UWYAL1JTMTQBJB7Y1QWGNLCR195D8DNX",
    vnpayHost: "https://sandbox.vnpayment.vn",
  });
  const isValid = vnpay.verifyReturnUrl(req.query);
  if (!isValid) {
    return next(new CustomException("Invalid signature", 400));
  }

  const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionStatus } = req.query;

  // Tìm giao dịch tạm thời
  const transaction = await transactionModel.findOne({ orderId: vnp_TxnRef });
  if (!transaction) {
    return next(new CustomException("Transaction not found", 404));
  }

  if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
    // Thanh toán thành công
    transaction.status = "completed";
    await transaction.save();

    // Gọi requestCreateOrder để tạo đơn hàng
    try {
      const order = await orderModel.create({
        gigId: transaction.gigId,
        customerId: transaction.userId,
        freelancerId: (await gigModel.findById(transaction.gigId)).freelancerId,
        title: (await gigModel.findById(transaction.gigId)).title,
        media: (await gigModel.findById(transaction.gigId)).media,
        requirements: transaction.requirements,
        price: transaction.amount,
      });

      // Chuyển hướng đến trang thành công với gigId
      return res.redirect(
        `http://localhost:3000/payment/success?gigId=${transaction.gigId}`
      );
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      transaction.status = "failed";
      await transaction.save();
      return res.redirect(
        `http://localhost:3000/payment/failed?gigId=${transaction.gigId}`
      );
    }
  } else {
    // Thanh toán thất bại
    transaction.status = "failed";
    await transaction.save();
    return res.redirect(
      `http://localhost:3000/payment/failed?gigId=${transaction.gigId}`
    );
  }
});

const getPaymentList = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    transactionModel
      .find({ userId: req.user._id })
      .populate("gigId", "title media")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    transactionModel.countDocuments({ userId: req.user._id }),
  ]);

  return res.status(200).json({
    error: false,
    message: "Get payment list successfully",
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    transactions,
  });
});

module.exports = {
  createPayment,
  getCheckPayment,
  getPaymentList,
};
