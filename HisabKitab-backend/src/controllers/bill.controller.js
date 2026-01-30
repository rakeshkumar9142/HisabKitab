const Bill = require("../models/Bill");
const Item = require("../models/item");
const { generateReceiptText } = require("../services/receipt.service");

// CREATE BILL
exports.createBill = async (req, res) => {
  const { items, paymentMethod } = req.body;
  /**
   * items = [
   *   { itemId: "...", quantity: 2 }
   * ]
   */

  let billItems = [];
  let total = 0;

  for (let i of items) {
    const item = await Item.findOne({
      _id: i.itemId,
      shop: req.user._id,
      isActive: true
    });

    if (!item) {
      return res.status(400).json({ message: "Invalid item" });
    }

    const subtotal = item.price * i.quantity;
    total += subtotal;

    billItems.push({
      item: item._id,
      name: item.name,
      price: item.price,
      quantity: i.quantity,
      subtotal
    });
  }

  const bill = await Bill.create({
    shop: req.user._id,
    items: billItems,
    totalAmount: total,
    paymentMethod
  });

  const receiptText = generateReceiptText(bill);

  res.status(201).json({
    billId: bill._id,
    totalAmount: bill.totalAmount,
    receiptText
  });
};

// GET BILLS (history)
exports.getBills = async (req, res) => {
  const bills = await Bill.find({ shop: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(bills);
};
