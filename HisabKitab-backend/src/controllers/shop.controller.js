const { assertReqUser } = require("../utils/assertReqUser");

exports.renewSubscription = async (req, res) => {
    if (!assertReqUser(req, res)) return;
    const oneYear = 365 * 24 * 60 * 60 * 1000;
  
    req.user.subscription = {
      plan: "PAID",
      expiresAt: new Date(Date.now() + oneYear)
    };
  
    await req.user.save();
  
    res.json({
      message: "Subscription renewed for 1 year",
      expiresAt: req.user.subscription.expiresAt
    });
  };
  