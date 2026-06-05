const express = require("express");
const subscriptionRoute = express.Router();
const subscriptionController = require("../controllers/subscription.controller");
const { protect, isRecruiter } = require("../middlewares/auth.middleware");
const { paymentLimiter } = require("../middlewares/security");

subscriptionRoute.use(protect);

subscriptionRoute.get("/plans", subscriptionController.getPlans);
subscriptionRoute.get("/plans/:planId", isRecruiter, subscriptionController.getPlanById);
subscriptionRoute.post("/create-order", isRecruiter, paymentLimiter, subscriptionController.createOrder);
subscriptionRoute.post("/verify-payment", isRecruiter, paymentLimiter, subscriptionController.verifyPayment);
subscriptionRoute.post("/payment-failed", isRecruiter, paymentLimiter, subscriptionController.recordPaymentFailure);
subscriptionRoute.get("/my-subscription", isRecruiter, subscriptionController.getMySubscription);
subscriptionRoute.get("/transactions", subscriptionController.getTransactions);
subscriptionRoute.get("/transactions/:paymentId", subscriptionController.getTransactionDetails);
subscriptionRoute.get("/invoice/:paymentId", subscriptionController.getTransactionDetails);
subscriptionRoute.get("/usage", isRecruiter, subscriptionController.getUsage);
subscriptionRoute.post("/cancel", isRecruiter, subscriptionController.cancelSubscription);

module.exports = subscriptionRoute;
