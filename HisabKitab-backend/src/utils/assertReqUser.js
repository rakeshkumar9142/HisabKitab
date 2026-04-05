function assertReqUser(req, res) {
  if (!req.user || !req.user._id) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }
  return true;
}

module.exports = { assertReqUser };
