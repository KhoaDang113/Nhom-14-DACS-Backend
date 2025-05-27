const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Types.ObjectId,
    ref: "Gig",
    require: true,
  },
  customerId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    require: true,
  },
});
favoriteSchema.index({ customerId: 1, gigId: 1 }, { unique: true });
module.exports = mongoose.model("Favorite", favoriteSchema);
