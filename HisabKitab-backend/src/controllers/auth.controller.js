const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/jwt");
const { isSubscriptionActive } = require("../services/subscription.service");

const generateToken = (id) => {

  return jwt.sign(

    { id }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES_IN }

    );
};

exports.register = async (req, res) => {
  const { name, phone, password } = req.body;

  const exists = await User.findOne({ phone });

  if (exists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, phone, password });

  res.status(201).json({

    _id: user._id,
    name: user.name,
    token: generateToken(user._id)
    
  });

};

exports.login = async (req, res) => {
  
  const { phone, password } = req.body;

  const user = await User.findOne({ phone });

  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });

  res.json({
    _id: user._id,
    name: user.name,
    token: generateToken(user._id)
  });


};

exports.getMe = async (req, res) => {
  // `protect` already sets `req.user` for us.
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
