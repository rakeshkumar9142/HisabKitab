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

// ✅ MIDDLEWARE (ORDER MATTERS)
app.use(cors({
    origin: "*",
    credentials: true,
  }));
  
  app.options("*", cors());

app.use(express.json());
app.use(morgan("dev"));

// ✅ ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/shop", shopRoutes);

module.exports = app;