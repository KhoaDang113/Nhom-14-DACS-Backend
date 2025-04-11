const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const svix = require("svix");
const app = express();
const {
  ClerkExpressRequireAuth,
  ClerkExpressWithAuth,
} = require("@clerk/clerk-sdk-node");
const errorHandler = require("./src/middlewares/errorHandler");
const connectDB = require("./src/config/db");

//Import routes
const webhookRouter = require("./src/routes/webhook");
const gigRouter = require("./src/routes/gigs");
const sitRouter = require("./src/routes/site");
const profileRouter = require("./src/routes/profile");
const orderRouter = require("./src/routes/order");
const favoriteRouter = require("./src/routes/favorite");
const conversationRouter = require("./src/routes/conversation");
const messageRouter = require("./src/routes/message");
const gigAdminRouter = require("./src/routes/Admin/gigAdmin");
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
app.use(cors());
app.use(morgan("common"));
app.use(express.json());

connectDB();

//Routes
app.use("/api/webhooks", webhookRouter);
app.use("/api/gigs", gigRouter);
app.use("/api/profile", profileRouter);
app.use("/api/order", orderRouter);
app.use("/api/favorite", favoriteRouter);
app.use("/api/conversation", conversationRouter);
app.use("/api/message", messageRouter);
app.use("/api/admin/gigs", gigAdminRouter);
app.use("/", sitRouter);
app.use(errorHandler);
const port = 5000;
app.listen(port, () => {
  console.log(`Server listen in port ${port}`);
});
