require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);

const itemRoutes = require("./routes/item.routes");

app.use("/api/items", itemRoutes);

const billRoutes = require("./routes/bill.routes");

app.use("/api/bills", billRoutes);

const deviceRoutes = require("./routes/device.routes");

app.use("/api/devices", deviceRoutes);

const shopRoutes = require("./routes/shop.routes");
app.use("/api/shop", shopRoutes);


module.exports = app;
