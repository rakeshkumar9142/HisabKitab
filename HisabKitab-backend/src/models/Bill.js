const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true
    },
    name: String,        // snapshot
    price: Number,       // snapshot
    quantity: Number,
    subtotal: Number
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [billItemSchema],
    totalAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card"],
      default: "cash"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
