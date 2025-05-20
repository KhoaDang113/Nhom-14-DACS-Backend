const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const { Server } = require("socket.io");
const http = require("http");
const svix = require("svix");
const app = express();
const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");
const errorHandler = require("./src/middlewares/errorHandler");
const connectDB = require("./src/config/db");
const initializeSocket = require("./src/socket/socket");

//Import routes
const webhookRouter = require("./src/routes/webhook");
const gigRouter = require("./src/routes/gigs");
const sitRouter = require("./src/routes/site");
const profileRouter = require("./src/routes/profile");
const orderRouter = require("./src/routes/order");
const favoriteRouter = require("./src/routes/favorite");
const conversationRouter = require("./src/routes/conversation");
const messageRouter = require("./src/routes/message");
const complaintRouter = require("./src/routes/complaint");
const reviewRouter = require("./src/routes/review");
const reviewVoteRouter = require("./src/routes/reviewVote");
const responseRouter = require("./src/routes/response");
const userRouter = require("./src/routes/user");
const paymentRouter = require("./src/routes/payment");
const notificationRouter = require("./src/routes/notification");

//Import routes of admin
const gigAdminRouter = require("./src/routes/Admin/gigAdmin");
const categoryAdminRouter = require("./src/routes/Admin/categoryAdmin");
const complaintAdminRouter = require("./src/routes/Admin/complaintAdmin");
const userAdminRouter = require("./src/routes/Admin/userAdmin");
const dashboardAdminRouter = require("./src/routes/Admin/dashboardAdmin");
// const notificationRouter = require("./src/routes/notification");
dotenv.config();

const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkPublishableKey || !clerkSecretKey) {
  throw new Error("CLERK_PUBLISHABLE_KEY is not defined in .env file");
}
app.use(
  ClerkExpressWithAuth({
    publishableKey: clerkPublishableKey,
    secretKey: clerkSecretKey,
  })
);
app.use(
  cors({
    origin: ["http://localhost:3000", "https://sandbox.vnpayment.vn"],
    credentials: true,
  })
);
app.use(morgan("common"));
app.use(express.json());

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
initializeSocket(io);
app.use("/api/webhooks", webhookRouter);
//Routes of customer and freelancer
app.use("/api/gigs", gigRouter);
app.use("/api/profile", profileRouter);
app.use("/api/order", orderRouter);
app.use("/api/favorite", favoriteRouter);
app.use("/api/conversation", conversationRouter);
app.use("/api/message", messageRouter(io));
app.use("/api/complaint", complaintRouter);
app.use("/api/review", reviewRouter);
app.use("/api/review-vote", reviewVoteRouter);
app.use("/api/response", responseRouter(io));
app.use("/api/user", userRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/notifications", notificationRouter);

//Routes of admin
app.use("/api/admin/gigs", gigAdminRouter);
app.use("/api/admin/category", categoryAdminRouter);
app.use("/api/admin/complaint", complaintAdminRouter);
app.use("/api/admin/user", userAdminRouter);
app.use("/api/admin/dashboard", dashboardAdminRouter);

//Common router
app.use("/", sitRouter);
app.use(errorHandler);

const port = 5000;
server.listen(port, () => {
  console.log(`Server listen in port ${port}`);
});
