const { CustomException, catchAsync } = require("../utils");
const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");

const createPayment = catchAsync(async (req, res, next) => {
  const { amount, orderId } = req.body;

  if (!amount || !orderId) {
    return next(new CustomException("Missing required fields", 400));
  }

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
    vnp_Amount: amount * 100,
    vnp_IpAddr: "127.0.0.1",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}`,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: "http://localhost:3000/api/v1/payment/return",
    vnp_Locale: VnpLocale.VN, // Ngôn ngữ hiển thị
    vnp_CreateDate: dateFormat(new Date(), "yyyyMMddHHmmss"), // Thời gian tạo giao dịch
    vnp_ExpireDate: dateFormat(
      new Date(new Date().getTime() + 30 * 60 * 1000),
      "yyyyMMddHHmmss"
    ), // Thời gian hết hạn giao dịch
  });

  res.status(200).json(vnpayResponse);
});

module.exports = {
  createPayment,
};
