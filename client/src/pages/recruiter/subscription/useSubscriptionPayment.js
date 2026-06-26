import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { subscriptionApi } from "../../../api/api";
import {
  getErrorMessage,
  getPlanDisplayName,
  isUsableRazorpayKey,
  loadRazorpayCheckout,
} from "./subscriptionUtils";

const FRONTEND_RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const buildFailurePayload = ({ order, planId, response }) => {
  const error = response?.error || response || {};
  return {
    planId,
    razorpay_order_id: order?.orderId || error?.metadata?.order_id,
    razorpay_payment_id: error?.metadata?.payment_id,
    error,
  };
};

export default function useSubscriptionPayment({ onVerified } = {}) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [payingPlanId, setPayingPlanId] = useState("");

  const startPayment = useCallback(
    async (plan, options = {}) => {
      const planId = plan?._id;
      if (!planId) {
        toast.error("Selected plan is unavailable.");
        return;
      }

      const successRoute = options.successRoute || "/recruiter/subscription/payment-success";
      const failedRoute = options.failedRoute || "/recruiter/subscription/payment-failed";

      try {
        setPayingPlanId(planId);

        const orderRes = await subscriptionApi.post("/create-order", { planId });
        const order = orderRes.data?.data;
        const checkoutKey = order?.keyId || (isUsableRazorpayKey(FRONTEND_RAZORPAY_KEY_ID) ? FRONTEND_RAZORPAY_KEY_ID : "");

        if (!checkoutKey) {
          throw new Error("Razorpay key is not configured.");
        }

        const scriptLoaded = await loadRazorpayCheckout();
        if (!scriptLoaded) {
          throw new Error("Razorpay checkout script could not be loaded.");
        }

        const checkout = new window.Razorpay({
          key: checkoutKey,
          amount: order.amount,
          currency: order.currency,
          name: "Job Placement Platform",
          description: getPlanDisplayName(order.plan || plan),
          order_id: order.orderId,
          prefill: {
            name: user?.username || "",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          notes: {
            planId,
            transactionId: order.transactionId,
          },
          retry: {
            enabled: true,
            max_count: 2,
          },
          theme: { color: "#0f766e" },
          handler: async (paymentResponse) => {
            try {
              const verifyRes = await subscriptionApi.post("/verify-payment", {
                ...paymentResponse,
                planId,
              });
              const verified = verifyRes.data?.data || {};
              toast.success("Payment verified. Subscription activated.");
              await onVerified?.(verified);
              navigate(successRoute, {
                replace: true,
                state: {
                  plan: order.plan || plan,
                  order,
                  subscription: verified.subscription,
                  transaction: verified.transaction,
                  paymentId: paymentResponse.razorpay_payment_id,
                  orderId: paymentResponse.razorpay_order_id,
                },
              });
            } catch (error) {
              const message = getErrorMessage(error, "Payment verification failed.");
              toast.error(message);
              navigate(failedRoute, {
                replace: true,
                state: {
                  plan: order.plan || plan,
                  order,
                  message,
                  error: error.response?.data || error.message,
                },
              });
            } finally {
              setPayingPlanId("");
            }
          },
          modal: {
            ondismiss: () => setPayingPlanId(""),
          },
        });

        if (typeof checkout.on === "function") {
          checkout.on("payment.failed", async (response) => {
            const payload = buildFailurePayload({ order, planId, response });
            const message = getErrorMessage(response, "Payment failed. Please try again.");

            try {
              await subscriptionApi.post("/payment-failed", payload);
            } catch {
              // Continue the user-facing payment failure flow even if audit recording fails.
            }

            toast.error(message);
            setPayingPlanId("");
            navigate(failedRoute, {
              replace: true,
              state: {
                plan: order.plan || plan,
                order,
                message,
                error: response?.error || response,
              },
            });
          });
        }

        checkout.open();
      } catch (error) {
        const message = getErrorMessage(error, "Unable to start Razorpay payment.");
        toast.error(message);
        setPayingPlanId("");
        navigate(failedRoute, {
          replace: true,
          state: {
            plan,
            message,
            error: error.response?.data || error.message,
          },
        });
      }
    },
    [navigate, onVerified, user?.email, user?.phone, user?.username]
  );

  return { payingPlanId, startPayment };
}
