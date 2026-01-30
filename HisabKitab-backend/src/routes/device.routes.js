const express = require("express");
const router = express.Router();
const {
  registerDevice,
  getDevices,
  disableDevice
} = require("../controllers/device.controller");

const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/", registerDevice);
router.get("/", getDevices);
router.delete("/:id", disableDevice);

module.exports = router;
