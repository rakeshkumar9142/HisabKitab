const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    deviceToken: {
      type: String,
      required: true,
      unique: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastSeenAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Device", deviceSchema);
