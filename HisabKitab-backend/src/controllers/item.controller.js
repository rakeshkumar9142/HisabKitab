const Item = require("../models/item");

// CREATE ITEM
exports.createItem = async (req, res) => {

  const { name, price, unit } = req.body;

  const item = await Item.create({
    shop: req.user._id,
    name,
    price,
    unit
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

  item.name = req.body.name || item.name;
  item.price = req.body.price || item.price;
  item.unit = req.body.unit || item.unit;

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
