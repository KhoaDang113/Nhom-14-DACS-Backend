const { CustomException } = require("../utils");

const roleMiddleware = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    throw new CustomException("Access denied", 403);
  }
  next();
};
module.exports = { roleMiddleware };
