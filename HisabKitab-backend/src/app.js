require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes.js");
const itemRoutes = require("./routes/item.routes");
const billRoutes = require("./routes/bill.routes");
const deviceRoutes = require("./routes/device.routes");
const shopRoutes = require("./routes/shop.routes");

const app = express();

// ✅ HARD FIX (this guarantees headers)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ✅ ALSO KEEP cors()
app.use(cors());

// ✅ Handle preflight
app.options("*", cors());

app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/shop", shopRoutes);

module.exports = app;