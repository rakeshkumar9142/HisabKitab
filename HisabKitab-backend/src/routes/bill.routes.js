const express = require("express");
const router = express.Router();
const { createBill, getBills } = require("../controllers/bill.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/", createBill);
router.get("/", getBills);

module.exports = router;
