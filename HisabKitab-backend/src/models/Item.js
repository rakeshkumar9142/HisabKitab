const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      default: "pcs" // pcs, kg, litre
    },
    // Optional inventory tracking. If unset (legacy items), billing will still work
    // but stock will not be decremented.
    stock: {
      type: Number,
    },
    lowStockThreshold: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model("Item", itemSchema);
