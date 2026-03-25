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

// ✅ SIMPLE + SAFE CORS (NO CRASH, NO 500)
app.use(cors({
  origin: "*",   // allow all (for now)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Handle preflight properly
app.options("*", cors());

// ✅ Middleware
app.use(express.json());
app.use(morgan("dev"));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/shop", shopRoutes);

// ✅ Default route (for testing)
app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;