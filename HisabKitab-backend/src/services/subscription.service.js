exports.isSubscriptionActive = (user) => {
    if (!user.subscription || !user.subscription.expiresAt) {
      return false;
    }
  
    return new Date(user.subscription.expiresAt) > new Date();
  };
  