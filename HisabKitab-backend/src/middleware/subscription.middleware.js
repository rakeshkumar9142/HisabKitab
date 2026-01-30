const { isSubscriptionActive } = require("../services/subscription.service");

const checkSubscription = (req, res, next) => {
  const active = isSubscriptionActive(req.user);

  if (!active) {
    return res.status(403).json({
      message: "Subscription expired. Please renew."
    });
  }

  next();
};

module.exports = { checkSubscription };
