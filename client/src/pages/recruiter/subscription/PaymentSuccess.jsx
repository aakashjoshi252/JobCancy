import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, FileText, ListChecks, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { subscriptionApi } from "../../../api/api";
import { formatCurrency, formatDate, getPaymentIdentifier } from "./subscriptionUtils";

export default function SubscriptionPaymentSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(!state?.subscription);

  useEffect(() => {
    if (state?.subscription) {
      setSubscriptionData({ activeSubscription: state.subscription, transaction: state.transaction });
      return undefined;
    }

    let active = true;
    subscriptionApi
      .get("/my-subscription")
      .then((response) => {
        if (active) setSubscriptionData(response.data?.data || null);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Unable to load subscription status.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [state]);

  const subscription = subscriptionData?.activeSubscription;
  const transaction = subscriptionData?.transaction || state?.transaction;
  const paymentIdentifier = getPaymentIdentifier(transaction);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <RefreshCw className="h-10 w-10 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <section className="mx-auto max-w-2xl rounded-lg border border-green-200 bg-white p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
        <h1 className="mt-4 text-2xl font-bold text-gray-950">Payment Successful</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your recruiter subscription is active after server-side Razorpay verification.
        </p>

        <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
          <Info label="Plan" value={subscription?.planId?.planName || subscription?.planSnapshot?.planName} />
          <Info label="Valid until" value={formatDate(subscription?.endDate)} />
          <Info label="Amount" value={formatCurrency(transaction?.amount)} />
          <Info label="Payment ID" value={transaction?.razorpayPaymentId || state?.paymentId || "-"} mono />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate("/recruiter/subscription/details")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <ListChecks className="h-4 w-4" />
            View Details
          </button>
          {paymentIdentifier && (
            <button
              type="button"
              onClick={() => navigate(`/recruiter/subscription/invoice/${paymentIdentifier}`)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              <FileText className="h-4 w-4" />
              View Invoice
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function Info({ label, value, mono = false }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className={`mt-1 break-words text-sm font-bold text-gray-950 ${mono ? "font-mono" : ""}`}>{value || "-"}</p>
    </div>
  );
}
