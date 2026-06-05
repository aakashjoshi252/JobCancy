const {
  SubscriptionError,
  ensureCanPostJob,
  expireDueSubscriptionsForRecruiter,
  getUsageSummary,
  recordJobPostUsage: recordJobPostUsageService,
} = require("../services/subscription.service");

const sendSubscriptionError = (res, error) =>
  res.status(error.status || 403).json({
    success: false,
    code: error.code,
    message: error.message,
  });

const requireActiveSubscription = async (req, res, next) => {
  try {
    await expireDueSubscriptionsForRecruiter(req.user._id);
    const usage = await getUsageSummary(req.user._id);

    if (!usage.hasSubscription) {
      throw new SubscriptionError({
        code: "SUBSCRIPTION_REQUIRED",
        message: "Please purchase a subscription plan to post jobs.",
      });
    }

    req.subscriptionUsage = usage;
    req.activeSubscription = usage.subscription;
    next();
  } catch (error) {
    if (error instanceof SubscriptionError) {
      return sendSubscriptionError(res, error);
    }

    return res.status(500).json({
      success: false,
      message: "Unable to validate subscription.",
      error: error.message,
    });
  }
};

const checkJobPostLimit = async (req, res, next) => {
  try {
    const usage = req.subscriptionUsage || (await ensureCanPostJob(req.user._id));

    if (!usage.canPost) {
      throw new SubscriptionError({
        code: "JOB_POST_LIMIT_EXCEEDED",
        message: "Your monthly job posting limit is over. Please upgrade your plan.",
      });
    }

    req.subscriptionUsage = usage;
    next();
  } catch (error) {
    if (error instanceof SubscriptionError) {
      return sendSubscriptionError(res, error);
    }

    return res.status(500).json({
      success: false,
      message: "Unable to validate job posting limit.",
      error: error.message,
    });
  }
};

const recordJobPostUsage = (req, _res, next) => {
  req.recordJobPostUsage = async (job, session = null) =>
    recordJobPostUsageService({
      recruiterId: req.user._id,
      jobId: job._id,
      session,
    });

  next();
};

module.exports = {
  checkJobPostLimit,
  recordJobPostUsage,
  requireActiveSubscription,
};
