const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const { JWT_SECRET: JWT_SECRET_FALLBACK, JWT_EXPIRES_IN } = require("../config/jwt");
const { isSubscriptionActive } = require("../services/subscription.service");

const getJwtSecret = () => process.env.JWT_SECRET || JWT_SECRET_FALLBACK;

const generateToken = (id) => {
  const sub = userIdToString(id);
  return jwt.sign({ id: sub }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
};

function userIdToString(id) {
  if (id == null) return "";
  if (typeof id.toString === "function") return id.toString();
  return String(id);
}

exports.register = async (req, res) => {
  const { name, phone, password } = req.body;

  const exists = await User.findOne({ phone });

  if (exists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, phone, password });

  const token = generateToken(user._id);
  res.status(201).json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
    },
  });
};

exports.login = async (req, res) => {
  
  const { phone, password } = req.body;

  const user = await User.findOne({ phone });

  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });

  const token = generateToken(user._id);
  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
    },
  });
};

exports.getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = req.user;
  res.json({
    _id: user._id,
    name: user.name,
    phone: user.phone,
    subscription: user.subscription || null,
    subscriptionActive: isSubscriptionActive(user),
  });
};

exports.updateMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { name } = req.body;

  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (!trimmed) return res.status(400).json({ message: "Name is required" });
  }

  // Fetch full user document (including password) to avoid accidentally overwriting
  // fields that were excluded by `protect` select().
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (name !== undefined) user.name = String(name).trim();
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    phone: user.phone,
    subscription: user.subscription || null,
    subscriptionActive: isSubscriptionActive(user),
  });
};
