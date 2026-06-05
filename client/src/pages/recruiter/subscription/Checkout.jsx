import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, CreditCard, FileText, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { subscriptionApi } from "../../../api/api";
import useSubscriptionPayment from "./useSubscriptionPayment";
import { durationLabel, formatCurrency, planLimitLabel } from "./subscriptionUtils";

export default function SubscriptionCheckout() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const { payingPlanId, startPayment } = useSubscriptionPayment();

  useEffect(() => {
    let active = true;

    subscriptionApi
      .get(`/plans/${planId}`)
      .then((response) => {
        if (active) setPlan(response.data?.data || null);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Unable to load checkout.");
        navigate("/recruiter/subscription/plans", { replace: true });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate, planId]);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <RefreshCw className="h-10 w-10 animate-spin text-teal-700" />
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <button
        type="button"
        onClick={() => navigate("/recruiter/subscription/plans")}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to plans
      </button>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-700" />
            <h1 className="text-2xl font-bold text-gray-950">Checkout Review</h1>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">
            <h2 className="text-xl font-bold text-gray-950">{plan.planName}</h2>
            <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Detail label="Validity" value={durationLabel(plan)} icon={<CalendarClock className="h-4 w-4" />} />
              <Detail label="Posting quota" value={planLimitLabel(plan)} icon={<CreditCard className="h-4 w-4" />} />
            </div>
          </div>
        </section>

        <aside className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-950">Order Summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Plan</span>
              <span className="font-semibold text-gray-950">{plan.planName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Amount</span>
              <span className="font-semibold text-gray-950">{formatCurrency(plan.price)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="font-semibold text-gray-950">Total</span>
              <span className="text-xl font-bold text-teal-800">{formatCurrency(plan.price)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => startPayment(plan)}
            disabled={payingPlanId === plan._id}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CreditCard className="h-4 w-4" />
            {payingPlanId === plan._id ? "Opening Razorpay..." : "Pay with Razorpay"}
          </button>
          <p className="mt-3 text-xs text-gray-500">
            Your subscription activates only after server-side payment verification succeeds.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-teal-700">{icon}</div>
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-950">{value}</p>
    </div>
  );
}
