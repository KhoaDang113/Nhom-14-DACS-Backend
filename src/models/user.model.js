// User Schema

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    avatar: { type: String, required: true, default: "" },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["freelancer", "customer", "admin"],
      required: true,
    },
    facebookId: { type: String },
    googleId: { type: String },
    isLocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
