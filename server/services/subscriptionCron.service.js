const RecruiterSubscription = require("../models/recruiterSubscription.model");
const logger = require("../utils/logger");
const {
  notifySubscriptionExpired,
  notifySubscriptionExpiringSoon,
} = require("../utils/notificationHelper");

let cronStarted = false;

const runSubscriptionExpirySweep = async () => {
  const now = new Date();
  const soon = new Date(now);
  soon.setDate(soon.getDate() + 7);

  const expiringSoon = await RecruiterSubscription.find({
    status: "active",
    endDate: { $gt: now, $lte: soon },
  }).populate("planId");

  await Promise.all(
    expiringSoon.map((subscription) =>
      notifySubscriptionExpiringSoon(subscription.recruiterId, subscription)
    )
  );

  const expired = await RecruiterSubscription.find({
    status: "active",
    endDate: { $lte: now },
  }).populate("planId");

  if (!expired.length) return { expiringSoon: expiringSoon.length, expired: 0 };

  await RecruiterSubscription.updateMany(
    { _id: { $in: expired.map((subscription) => subscription._id) } },
    { $set: { status: "expired", remainingPosts: 0 } }
  );

  await Promise.all(
    expired.map((subscription) => notifySubscriptionExpired(subscription.recruiterId, subscription))
  );

  return { expiringSoon: expiringSoon.length, expired: expired.length };
};

const startSubscriptionExpiryCron = () => {
  if (cronStarted || process.env.NODE_ENV === "test") return;
  cronStarted = true;

  const intervalMs = Number(process.env.SUBSCRIPTION_CRON_INTERVAL_MS || 24 * 60 * 60 * 1000);

  setTimeout(() => {
    runSubscriptionExpirySweep().catch((error) => {
      logger.error(`Subscription expiry sweep failed: ${error.message}`);
    });
  }, 30 * 1000);

  setInterval(() => {
    runSubscriptionExpirySweep().catch((error) => {
      logger.error(`Subscription expiry sweep failed: ${error.message}`);
    });
  }, intervalMs);
};

module.exports = {
  runSubscriptionExpirySweep,
  startSubscriptionExpiryCron,
};
