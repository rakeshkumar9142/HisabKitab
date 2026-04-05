const Bill = require("../models/Bill");
const Item = require("../models/Item");
const { generateReceiptText } = require("../services/receipt.service");
const { assertReqUser } = require("../utils/assertReqUser");

// CREATE BILL
exports.createBill = async (req, res) => {
  if (!assertReqUser(req, res)) return;
  const { items, paymentMethod } = req.body;
  /**
   * items = [
   *   { itemId: "...", quantity: 2 }
   * ]
   */

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items must be a non-empty array" });
  }

  let billItems = [];
  let total = 0;
  const stockDecrements = []; // items that track stock

  // 1) Validate all items + quantities, compute bill items and prepare stock decrements.
  for (let i of items) {
    const qty = Number(i.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const item = await Item.findOne({
      _id: i.itemId,
      shop: req.user._id,
      isActive: true,
    });

    if (!item) {
      return res.status(400).json({ message: "Invalid item" });
    }

    const trackedStock = typeof item.stock === "number" && Number.isFinite(item.stock);
    if (trackedStock) {
      if (item.stock < qty) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${item.name}` });
      }
      stockDecrements.push({ itemId: item._id, qty });
    }

    const subtotal = item.price * qty;
    total += subtotal;

    billItems.push({
      item: item._id,
      name: item.name,
      price: item.price,
      quantity: qty,
      subtotal,
    });
  }

  // 2) Decrement stock after validation.
  const decremented = [];
  try {
    for (let d of stockDecrements) {
      const updateResult = await Item.updateOne(
        { _id: d.itemId, shop: req.user._id, stock: { $gte: d.qty } },
        { $inc: { stock: -d.qty } }
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error("Insufficient stock");
      }

      decremented.push(d);
    }
  } catch (err) {
    // Best-effort rollback (no transaction). If concurrent sales happen, exact consistency still
    // requires MongoDB transactions in production.
    await Promise.all(
      decremented.map((d) =>
        Item.updateOne({ _id: d.itemId, shop: req.user._id }, { $inc: { stock: d.qty } })
      )
    );

    return res.status(400).json({ message: err?.message || "Unable to update stock" });
  }

  // 3) Create bill.
  const bill = await Bill.create({
    shop: req.user._id,
    items: billItems,
    totalAmount: total,
    paymentMethod,
  });

  const receiptText = generateReceiptText(bill);

  res.status(201).json({
    billId: bill._id,
    totalAmount: bill.totalAmount,
    receiptText,
  });
};

// GET BILLS (history)
exports.getBills = async (req, res) => {
  if (!assertReqUser(req, res)) return;
  const bills = await Bill.find({ shop: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(bills);
};
