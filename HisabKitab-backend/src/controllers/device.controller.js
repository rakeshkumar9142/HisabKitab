const Device = require("../models/Device");
const crypto = require("crypto");

// REGISTER DEVICE
exports.registerDevice = async (req, res) => {
  const { name } = req.body;

  const deviceToken = crypto.randomBytes(24).toString("hex");

  const device = await Device.create({
    shop: req.user._id,
    name,
    deviceToken
  });

  res.status(201).json({
    deviceId: device._id,
    deviceToken: device.deviceToken
  });
};

// GET DEVICES
exports.getDevices = async (req, res) => {
  const devices = await Device.find({
    shop: req.user._id,
    isActive: true
  });

  res.json(devices);
};

// DISABLE DEVICE
exports.disableDevice = async (req, res) => {
  const device = await Device.findOne({
    _id: req.params.id,
    shop: req.user._id
  });

  if (!device) {
    return res.status(404).json({ message: "Device not found" });
  }

  device.isActive = false;
  await device.save();

  res.json({ message: "Device disabled" });
};
