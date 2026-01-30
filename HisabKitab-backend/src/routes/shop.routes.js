const express = require("express");
const router = express.Router();
const { renewSubscription } = require("../controllers/shop.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/renew", protect, renewSubscription);

module.exports = router;
