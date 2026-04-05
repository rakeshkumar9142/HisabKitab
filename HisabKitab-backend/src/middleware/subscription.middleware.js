const { isSubscriptionActive } = require("../services/subscription.service");

const checkSubscription = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const active = isSubscriptionActive(req.user);

  if (!active) {
    return res.status(403).json({
      message: "Subscription expired. Please renew."
    });
  }

  next();
};

module.exports = { checkSubscription };
