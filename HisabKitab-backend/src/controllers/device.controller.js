const Device = require("../models/Device");
const crypto = require("crypto");
const { assertReqUser } = require("../utils/assertReqUser");

// REGISTER DEVICE
exports.registerDevice = async (req, res) => {
  if (!assertReqUser(req, res)) return;
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
  if (!assertReqUser(req, res)) return;
  const devices = await Device.find({
    shop: req.user._id,
    isActive: true
  });

  res.json(devices);
};

// DISABLE DEVICE
exports.disableDevice = async (req, res) => {
  if (!assertReqUser(req, res)) return;
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
