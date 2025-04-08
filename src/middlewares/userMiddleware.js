const userMiddleware = async (req, res, next) => {
  try {
    // console.log("req.auth:", req.auth); // Debug để kiểm tra req.auth
    const userId = req.auth?.userId;
    console.log("userID", userId);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.UserID = userId;
    next();
  } catch (error) {
    // console.error("Clerk Auth Error:", error);
    return res.status(401).json({ message: "Invalid authentication" });
  }
};

module.exports = userMiddleware;
