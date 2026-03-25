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

// ✅ Single CORS configuration – handles both preflight and actual requests
app.use(
  cors({
    origin: true,               // Reflects the request origin (works for any origin, including file:// and localhost)
    credentials: true,          // Allows Authorization header and cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests explicitly (optional – cors already does it)
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