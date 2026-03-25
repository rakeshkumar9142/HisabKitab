const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { register, login, getMe, updateMe } = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);

module.exports = router;
