const mongoose = require("mongoose");
const SubscriptionPlan = require("../models/subscriptionPlan.model");
const RecruiterSubscription = require("../models/recruiterSubscription.model");
const PaymentTransaction = require("../models/paymentTransaction.model");
const JobPostUsage = require("../models/jobPostUsage.model");
const { getRazorpayKeyId } = require("../config/razorpay");
const {
  SubscriptionError,
  calculatePlanEndDate,
  createRazorpayOrder,
  ensureDefaultSubscriptionPlans,
  getSubscriptionReport,
  getUsageSummary,
  runWithOptionalTransaction,
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
} = require("../services/subscription.service");
const {
  notifyPaymentFailed,
  notifySubscriptionCancelled,
  notifySubscriptionPurchased,
  notifySubscriptionUpgraded,
} = require("../utils/notificationHelper");

const sendError = (res, error, fallback = "Subscription request failed") => {
  if (error instanceof SubscriptionError) {
    return res.status(error.status).json({
      success: false,
      code: error.code,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: fallback,
    error: error.message,
  });
};

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizePlanPayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || body.planName !== undefined) payload.planName = String(body.planName || "").trim();
  if (!partial || body.price !== undefined) payload.price = Number(body.price);
  payload.currency = "INR";
  if (!partial || body.isUnlimited !== undefined) payload.isUnlimited = Boolean(body.isUnlimited);
  if (!partial || body.jobPostLimit !== undefined || body.isUnlimited !== undefined) {
    payload.jobPostLimit = payload.isUnlimited || body.isUnlimited ? 0 : Number(body.jobPostLimit);
  }
  if (!partial || body.duration !== undefined) payload.duration = Number(body.duration);
  if (!partial || body.durationType !== undefined) payload.durationType = body.durationType;
  if (!partial || body.isActive !== undefined) {
    payload.isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;
  }
  if (!partial || body.description !== undefined) payload.description = String(body.description || "").trim();
  if (!partial || body.sortOrder !== undefined) payload.sortOrder = Number(body.sortOrder || 0);

  Object.keys(payload).forEach((key) => {
    if (payload[key] === "" || Number.isNaN(payload[key]) || payload[key] === undefined) {
      delete payload[key];
    }
  });

  return payload;
};

const extractFailureDetails = (payload = {}) => {
  const error = payload.error || payload;
  const metadata = error.metadata || payload.metadata || {};

  return {
    code: error.code || error.reason || payload.code || "",
    reason:
      error.description ||
      error.reason ||
      payload.failureReason ||
      payload.message ||
      "Razorpay payment failed.",
    paymentId: payload.razorpay_payment_id || metadata.payment_id || payload.paymentId || "",
    orderId: payload.razorpay_order_id || metadata.order_id || payload.orderId || "",
    raw: payload,
  };
};

const activateSubscriptionFromTransaction = async ({
  transactionId,
  recruiterId,
  paymentId,
  signature = "",
  actorId = null,
  source = "checkout",
  paidAt = new Date(),
}) => runWithOptionalTransaction(async (session) => {
  const lockedTransaction = await PaymentTransaction.findOne({
    _id: transactionId,
    status: { $nin: ["paid", "cancelled"] },
  })
    .populate("planId")
    .session(session);

  if (!lockedTransaction) {
    const existing = await PaymentTransaction.findById(transactionId).session(session);
    const existingSubscription = existing?.subscriptionId
      ? await RecruiterSubscription.findById(existing.subscriptionId).populate("planId").session(session)
      : null;
    return { subscription: existingSubscription, hadPreviousSubscription: false };
  }

  const plan = lockedTransaction.planId;
  const now = paidAt || new Date();
  const endDate = calculatePlanEndDate(plan, now);
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const previousActive = await RecruiterSubscription.countDocuments({
    recruiterId,
    status: "active",
    endDate: { $gt: now },
  }).session(session);

  await RecruiterSubscription.updateMany(
    { recruiterId, status: "active" },
    {
      $set: {
        status: "cancelled",
        cancelledAt: now,
        cancelledBy: actorId || recruiterId,
      },
    },
    { session }
  );

  const [createdSubscription] = await RecruiterSubscription.create(
    [
      {
        recruiterId,
        planId: plan._id,
        status: "active",
        startDate: now,
        endDate,
        jobPostLimit: plan.jobPostLimit,
        jobsPostedCount: 0,
        remainingPosts: plan.isUnlimited ? null : plan.jobPostLimit,
        isUnlimited: plan.isUnlimited,
        paymentId,
        orderId: lockedTransaction.razorpayOrderId,
        paymentTransactionId: lockedTransaction._id,
        currentMonthKey: monthKey,
        currentMonthPostedCount: 0,
        planSnapshot: {
          planName: plan.planName,
          price: plan.price,
          currency: plan.currency,
          duration: plan.duration,
          durationType: plan.durationType,
        },
      },
    ],
    { session }
  );

  lockedTransaction.status = "paid";
  lockedTransaction.razorpayPaymentId = paymentId;
  lockedTransaction.razorpaySignature = signature || lockedTransaction.razorpaySignature || "";
  lockedTransaction.verifiedAt = now;
  lockedTransaction.subscriptionId = createdSubscription._id;
  lockedTransaction.failureReason = "";
  lockedTransaction.failureCode = "";
  lockedTransaction.metadata = {
    ...(lockedTransaction.metadata || {}),
    verifiedBy: source,
    verifiedAt: now,
  };
  await lockedTransaction.save({ session });

  return {
    subscription: await createdSubscription.populate("planId"),
    hadPreviousSubscription: previousActive > 0,
  };
});

const getPlans = async (_req, res) => {
  try {
    await ensureDefaultSubscriptionPlans();
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ sortOrder: 1, price: 1 });

    return res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    return sendError(res, error, "Unable to fetch subscription plans");
  }
};

const getPlanById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.planId)) {
      return res.status(400).json({
        success: false,
        code: "PLAN_ID_REQUIRED",
        message: "A valid subscription plan is required.",
      });
    }

    await ensureDefaultSubscriptionPlans();
    const plan = await SubscriptionPlan.findOne({ _id: req.params.planId, isActive: true });

    if (!plan) {
      return res.status(404).json({
        success: false,
        code: "PLAN_NOT_FOUND",
        message: "Subscription plan was not found or is inactive.",
      });
    }

    return res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    return sendError(res, error, "Unable to fetch subscription plan");
  }
};

const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId || !isValidObjectId(planId)) {
      return res.status(400).json({
        success: false,
        code: "PLAN_ID_REQUIRED",
        message: "A valid subscription plan is required.",
      });
    }

    const plan = await SubscriptionPlan.findOne({ _id: planId, isActive: true });
    if (!plan) {
      return res.status(404).json({
        success: false,
        code: "PLAN_NOT_FOUND",
        message: "Subscription plan was not found or is inactive.",
      });
    }

    const amountInPaise = Math.round(Number(plan.price) * 100);
    const keyId = getRazorpayKeyId();
    const receipt = `sub_${req.user._id.toString().slice(-8)}_${Date.now()}`;
    const order = await createRazorpayOrder({
      amountInPaise,
      currency: plan.currency,
      receipt,
      notes: {
        planId: plan._id.toString(),
        recruiterId: req.user._id.toString(),
        planName: plan.planName,
      },
    });

    const transaction = await PaymentTransaction.create({
      recruiterId: req.user._id,
      planId: plan._id,
      amount: plan.price,
      amountInPaise,
      currency: plan.currency,
      receipt,
      razorpayOrderId: order.id,
      status: "pending",
      metadata: {
        order,
        planSnapshot: {
          planName: plan.planName,
          price: plan.price,
          duration: plan.duration,
          durationType: plan.durationType,
          isUnlimited: plan.isUnlimited,
          jobPostLimit: plan.jobPostLimit,
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        amountInPaise,
        displayAmount: plan.price,
        currency: order.currency,
        keyId,
        gatewayMode: keyId?.startsWith("rzp_live_") ? "live" : "test",
        receipt,
        plan,
        transactionId: transaction._id,
      },
    });
  } catch (error) {
    return sendError(res, error, "Unable to create payment order");
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      planId,
    } = req.body;

    if (!orderId || !paymentId || !signature || !planId || !isValidObjectId(planId)) {
      return res.status(400).json({
        success: false,
        code: "PAYMENT_VERIFICATION_DATA_REQUIRED",
        message: "Payment verification data is incomplete.",
      });
    }

    const transaction = await PaymentTransaction.findOne({
      razorpayOrderId: orderId,
      recruiterId: req.user._id,
    }).populate("planId");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        code: "PAYMENT_TRANSACTION_NOT_FOUND",
        message: "Payment transaction was not found.",
      });
    }

    const transactionPlanId = transaction.planId?._id?.toString() || transaction.planId?.toString();
    if (transactionPlanId !== planId) {
      return res.status(409).json({
        success: false,
        code: "PAYMENT_PLAN_MISMATCH",
        message: "Payment order does not belong to the selected plan.",
      });
    }

    if (transaction.status === "paid" && transaction.subscriptionId) {
      const subscription = await RecruiterSubscription.findById(transaction.subscriptionId).populate("planId");
      return res.status(200).json({
        success: true,
        code: "PAYMENT_ALREADY_VERIFIED",
        message: "Payment already verified.",
        data: { subscription, transaction },
      });
    }

    if (transaction.status === "paid") {
      return res.status(409).json({
        success: false,
        code: "PAYMENT_ALREADY_PROCESSED",
        message: "This payment has already been processed.",
      });
    }

    if (transaction.status === "cancelled") {
      return res.status(409).json({
        success: false,
        code: "PAYMENT_TRANSACTION_CLOSED",
        message: "This payment order is no longer available for verification.",
      });
    }

    const duplicatePayment = await PaymentTransaction.findOne({
      razorpayPaymentId: paymentId,
      _id: { $ne: transaction._id },
    });

    if (duplicatePayment) {
      return res.status(409).json({
        success: false,
        code: "PAYMENT_ALREADY_USED",
        message: "This payment has already been recorded for another subscription.",
      });
    }

    const isValidSignature = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
      secret: process.env.RAZORPAY_KEY_SECRET,
    });

    if (!isValidSignature) {
      transaction.status = "failed";
      transaction.razorpayPaymentId = paymentId;
      transaction.failureReason = "Invalid Razorpay signature";
      transaction.failureCode = "INVALID_PAYMENT_SIGNATURE";
      transaction.gatewayResponse = {
        orderId,
        paymentId,
        receivedSignature: signature,
      };
      await transaction.save();
      await notifyPaymentFailed(req.user._id, transaction);

      return res.status(400).json({
        success: false,
        code: "INVALID_PAYMENT_SIGNATURE",
        message: "Payment verification failed because the Razorpay signature did not match.",
      });
    }

    const { subscription, hadPreviousSubscription } = await activateSubscriptionFromTransaction({
      transactionId: transaction._id,
      recruiterId: req.user._id,
      paymentId,
      signature,
      actorId: req.user._id,
      source: "checkout",
    });

    if (subscription) {
      await notifySubscriptionPurchased(req.user._id, subscription);
      if (hadPreviousSubscription) {
        await notifySubscriptionUpgraded(req.user._id, subscription);
      }
    }

    const paidTransaction = await PaymentTransaction.findById(transaction._id)
      .populate("planId")
      .populate("subscriptionId");

    return res.status(200).json({
      success: true,
      message: "Payment verified and subscription activated.",
      data: {
        subscription,
        transaction: paidTransaction,
      },
    });
  } catch (error) {
    return sendError(res, error, "Unable to verify payment");
  }
};

const getMySubscription = async (req, res) => {
  try {
    const [usage, latestSubscription, transactions] = await Promise.all([
      getUsageSummary(req.user._id),
      RecruiterSubscription.findOne({ recruiterId: req.user._id })
        .populate("planId")
        .sort({ createdAt: -1 }),
      PaymentTransaction.find({ recruiterId: req.user._id })
        .populate("planId")
        .sort({ createdAt: -1 })
        .limit(20),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        activeSubscription: usage.subscription,
        latestSubscription,
        usage,
        billingHistory: transactions,
      },
    });
  } catch (error) {
    return sendError(res, error, "Unable to fetch subscription");
  }
};

const getTransactions = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};

    if (req.user.role === "recruiter") {
      query.recruiterId = req.user._id;
    } else if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        code: "SUBSCRIPTION_TRANSACTIONS_FORBIDDEN",
        message: "Only recruiters and admins can view subscription transactions.",
      });
    }

    if (req.query.status) query.status = req.query.status;
    if (req.query.planId && isValidObjectId(req.query.planId)) query.planId = req.query.planId;

    const [transactions, total] = await Promise.all([
      PaymentTransaction.find(query)
        .populate("recruiterId", "username email phone")
        .populate("planId")
        .populate("subscriptionId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PaymentTransaction.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return sendError(res, error, "Unable to fetch subscription transactions");
  }
};

const getTransactionDetails = async (req, res) => {
  try {
    const identifier = req.params.paymentId;
    const or = [
      { razorpayPaymentId: identifier },
      { razorpayOrderId: identifier },
    ];

    if (isValidObjectId(identifier)) {
      or.push({ _id: identifier });
    }

    const query = { $or: or };
    if (req.user.role === "recruiter") {
      query.recruiterId = req.user._id;
    } else if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        code: "SUBSCRIPTION_TRANSACTION_FORBIDDEN",
        message: "Only recruiters and admins can view subscription invoices.",
      });
    }

    const transaction = await PaymentTransaction.findOne(query)
      .populate("recruiterId", "username email phone")
      .populate("planId")
      .populate("subscriptionId");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        code: "PAYMENT_TRANSACTION_NOT_FOUND",
        message: "Payment transaction was not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    return sendError(res, error, "Unable to fetch payment transaction");
  }
};

const recordPaymentFailure = async (req, res) => {
  try {
    const failure = extractFailureDetails(req.body);

    if (!failure.orderId) {
      return res.status(400).json({
        success: false,
        code: "PAYMENT_FAILURE_ORDER_REQUIRED",
        message: "Razorpay order id is required to record a failed payment.",
      });
    }

    const transaction = await PaymentTransaction.findOne({
      razorpayOrderId: failure.orderId,
      recruiterId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        code: "PAYMENT_TRANSACTION_NOT_FOUND",
        message: "Payment transaction was not found.",
      });
    }

    if (transaction.status === "paid") {
      return res.status(200).json({
        success: true,
        code: "PAYMENT_ALREADY_VERIFIED",
        message: "Payment is already verified.",
        data: transaction,
      });
    }

    transaction.status = "failed";
    transaction.razorpayPaymentId = failure.paymentId || transaction.razorpayPaymentId;
    transaction.failureReason = failure.reason;
    transaction.failureCode = failure.code;
    transaction.gatewayResponse = failure.raw;
    transaction.metadata = {
      ...(transaction.metadata || {}),
      failureRecordedAt: new Date(),
      failureSource: "checkout",
    };
    await transaction.save();

    await notifyPaymentFailed(req.user._id, transaction);

    return res.status(200).json({
      success: true,
      message: "Payment failure recorded.",
      data: transaction,
    });
  } catch (error) {
    return sendError(res, error, "Unable to record failed payment");
  }
};

const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(503).json({
        success: false,
        code: "RAZORPAY_WEBHOOK_SECRET_MISSING",
        message: "Razorpay webhook secret is not configured.",
      });
    }

    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
    const signature = req.headers["x-razorpay-signature"];
    const isValid = verifyRazorpayWebhookSignature({
      rawBody,
      signature,
      secret: webhookSecret,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        code: "INVALID_WEBHOOK_SIGNATURE",
        message: "Razorpay webhook signature is invalid.",
      });
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    const payment = event?.payload?.payment?.entity;
    const orderId = payment?.order_id;

    if (!orderId) {
      return res.status(200).json({
        success: true,
        message: "Webhook ignored because no order id was present.",
      });
    }

    const transaction = await PaymentTransaction.findOne({ razorpayOrderId: orderId }).populate("planId");
    if (!transaction) {
      return res.status(200).json({
        success: true,
        message: "Webhook accepted; transaction was not found locally.",
      });
    }

    if (event.id && transaction.webhookEventIds.includes(event.id)) {
      return res.status(200).json({
        success: true,
        message: "Webhook already processed.",
      });
    }

    if (event.id) transaction.webhookEventIds.push(event.id);
    transaction.gatewayResponse = event;

    if (event.event === "payment.failed") {
      const failure = extractFailureDetails({
        error: payment?.error || payment,
        razorpay_order_id: orderId,
        razorpay_payment_id: payment?.id,
      });

      if (transaction.status !== "paid") {
        transaction.status = "failed";
        transaction.razorpayPaymentId = failure.paymentId || payment?.id || transaction.razorpayPaymentId;
        transaction.failureReason = failure.reason;
        transaction.failureCode = failure.code;
        transaction.metadata = {
          ...(transaction.metadata || {}),
          failureRecordedAt: new Date(),
          failureSource: "webhook",
        };
        await transaction.save();
        await notifyPaymentFailed(transaction.recruiterId, transaction);
      }

      return res.status(200).json({ success: true, message: "Payment failure webhook processed." });
    }

    if (event.event === "payment.captured" && transaction.status !== "paid") {
      await transaction.save();
      const { subscription, hadPreviousSubscription } = await activateSubscriptionFromTransaction({
        transactionId: transaction._id,
        recruiterId: transaction.recruiterId,
        paymentId: payment?.id,
        source: "webhook",
        paidAt: payment?.created_at ? new Date(payment.created_at * 1000) : new Date(),
      });

      if (subscription) {
        await notifySubscriptionPurchased(transaction.recruiterId, subscription);
        if (hadPreviousSubscription) {
          await notifySubscriptionUpgraded(transaction.recruiterId, subscription);
        }
      }

      return res.status(200).json({ success: true, message: "Payment success webhook processed." });
    }

    await transaction.save();
    return res.status(200).json({ success: true, message: "Webhook accepted." });
  } catch (error) {
    return sendError(res, error, "Unable to process Razorpay webhook");
  }
};

const getUsage = async (req, res) => {
  try {
    const usage = await getUsageSummary(req.user._id);
    const usageLogs = usage.subscription
      ? await JobPostUsage.find({
          recruiterId: req.user._id,
          subscriptionId: usage.subscription._id,
        })
          .populate("jobId", "title companyName status createdAt")
          .sort({ countedAt: -1 })
          .limit(30)
      : [];

    return res.status(200).json({
      success: true,
      data: {
        ...usage,
        usageLogs,
      },
    });
  } catch (error) {
    return sendError(res, error, "Unable to fetch usage");
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const subscription = await RecruiterSubscription.findOneAndUpdate(
      {
        recruiterId: req.user._id,
        status: "active",
        endDate: { $gt: new Date() },
      },
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancelledBy: req.user._id,
          remainingPosts: 0,
        },
      },
      { new: true }
    ).populate("planId");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        code: "ACTIVE_SUBSCRIPTION_NOT_FOUND",
        message: "No active subscription was found.",
      });
    }

    await notifySubscriptionCancelled(req.user._id, subscription);

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled.",
      data: subscription,
    });
  } catch (error) {
    return sendError(res, error, "Unable to cancel subscription");
  }
};

const getAdminPlans = async (_req, res) => {
  try {
    await ensureDefaultSubscriptionPlans();
    const plans = await SubscriptionPlan.find().sort({ sortOrder: 1, price: 1 });
    return res.status(200).json({ success: true, data: plans });
  } catch (error) {
    return sendError(res, error, "Unable to fetch subscription plans");
  }
};

const createAdminPlan = async (req, res) => {
  try {
    const payload = normalizePlanPayload(req.body);
    const plan = await SubscriptionPlan.create(payload);
    return res.status(201).json({
      success: true,
      message: "Subscription plan created.",
      data: plan,
    });
  } catch (error) {
    return sendError(res, error, "Unable to create subscription plan");
  }
};

const updateAdminPlan = async (req, res) => {
  try {
    const payload = normalizePlanPayload(req.body, { partial: true });

    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        code: "PLAN_NOT_FOUND",
        message: "Subscription plan was not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription plan updated.",
      data: plan,
    });
  } catch (error) {
    return sendError(res, error, "Unable to update subscription plan");
  }
};

const getAdminSubscriptions = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};

    if (req.query.status) query.status = req.query.status;
    if (req.query.planId) query.planId = req.query.planId;

    const [subscriptions, total, transactions, usageLogs, report] = await Promise.all([
      RecruiterSubscription.find(query)
        .populate("recruiterId", "username email phone")
        .populate("planId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RecruiterSubscription.countDocuments(query),
      PaymentTransaction.find()
        .populate("recruiterId", "username email")
        .populate("planId")
        .sort({ createdAt: -1 })
        .limit(50),
      JobPostUsage.find()
        .populate("recruiterId", "username email")
        .populate("jobId", "title companyName status")
        .populate("subscriptionId", "status")
        .populate("planId", "planName")
        .sort({ countedAt: -1 })
        .limit(50),
      getSubscriptionReport(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        subscriptions,
        transactions,
        usageLogs,
        report,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return sendError(res, error, "Unable to fetch subscriptions");
  }
};

const updateAdminSubscription = async (req, res) => {
  try {
    const allowedStatuses = ["active", "expired", "cancelled", "pending"];
    const patch = {};

    if (req.body.status && allowedStatuses.includes(req.body.status)) {
      patch.status = req.body.status;
      if (req.body.status === "cancelled") {
        patch.cancelledAt = new Date();
        patch.cancelledBy = req.user._id;
        patch.remainingPosts = 0;
      }
    }
    if (req.body.endDate) patch.endDate = new Date(req.body.endDate);
    if (req.body.remainingPosts !== undefined) patch.remainingPosts = Number(req.body.remainingPosts);

    const existing = await RecruiterSubscription.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        code: "SUBSCRIPTION_NOT_FOUND",
        message: "Subscription was not found.",
      });
    }

    if (patch.status === "active") {
      await RecruiterSubscription.updateMany(
        {
          recruiterId: existing.recruiterId,
          status: "active",
          _id: { $ne: existing._id },
        },
        {
          $set: {
            status: "cancelled",
            cancelledAt: new Date(),
            cancelledBy: req.user._id,
          },
        }
      );
    }

    const subscription = await RecruiterSubscription.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    })
      .populate("recruiterId", "username email phone")
      .populate("planId");

    return res.status(200).json({
      success: true,
      message: "Subscription updated.",
      data: subscription,
    });
  } catch (error) {
    return sendError(res, error, "Unable to update subscription");
  }
};

module.exports = {
  cancelSubscription,
  createAdminPlan,
  createOrder,
  getPlanById,
  getAdminPlans,
  getAdminSubscriptions,
  getMySubscription,
  getPlans,
  getTransactionDetails,
  getTransactions,
  getUsage,
  handleWebhook,
  recordPaymentFailure,
  updateAdminPlan,
  updateAdminSubscription,
  verifyPayment,
};
