const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message ?? "Something went wrong";

  const response = {
    error: true,
    message,
  };
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: "Upload failed, just 5 image || video",
      message: err.message,
    });
  }

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
