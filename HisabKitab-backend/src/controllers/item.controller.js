const Item = require("../models/Item");

// CREATE ITEM
exports.createItem = async (req, res) => {

  const { name, price, unit, stock, lowStockThreshold } = req.body;

  // Optional inventory fields (kept optional for legacy items).
  const stockNum =
    stock === undefined || stock === '' ? undefined : Number(stock);
  const lowStockThresholdNum =
    lowStockThreshold === undefined || lowStockThreshold === ''
      ? undefined
      : Number(lowStockThreshold);

  const item = await Item.create({
    shop: req.user._id,
    name,
    price,
    unit,
    stock: stockNum,
    lowStockThreshold: lowStockThresholdNum
  });

  res.status(201).json(item);

};

// GET ALL ITEMS (shop-wise)
exports.getItems = async (req, res) => {

  const items = await Item.find({
    shop: req.user._id,
    isActive: true
  }).sort({ createdAt: -1 });

  res.json(items);

};

// UPDATE ITEM
exports.updateItem = async (req, res) => {

  const item = await Item.findOne({
    _id: req.params.id,
    shop: req.user._id
  });

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  if (req.body.name !== undefined) item.name = req.body.name;
  if (req.body.price !== undefined) item.price = req.body.price;
  if (req.body.unit !== undefined) item.unit = req.body.unit;

  if (req.body.stock !== undefined) {
    item.stock = req.body.stock === '' ? undefined : Number(req.body.stock);
  }

  if (req.body.lowStockThreshold !== undefined) {
    item.lowStockThreshold =
      req.body.lowStockThreshold === '' ? undefined : Number(req.body.lowStockThreshold);
  }

  await item.save();
  res.json(item);

};

// DELETE ITEM (soft delete)
exports.deleteItem = async (req, res) => {

  const item = await Item.findOne({
    _id: req.params.id,
    shop: req.user._id
    
  });

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  item.isActive = false;
  await item.save();

  res.json({ message: "Item removed" });
};
