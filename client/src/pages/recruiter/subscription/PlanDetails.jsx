import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, CheckCircle2, CreditCard, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { subscriptionApi } from "../../../api/api";
import useSubscriptionPayment from "./useSubscriptionPayment";
import { durationLabel, formatCurrency, planLimitLabel } from "./subscriptionUtils";

export default function SubscriptionPlanDetails() {
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
        toast.error(error.response?.data?.message || "Unable to load plan details.");
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

      <section className="max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-950">{plan.planName}</h1>
        <p className="mt-3 text-4xl font-bold text-teal-800">{formatCurrency(plan.price)}</p>
        <p className="mt-4 text-sm leading-6 text-gray-600">{plan.description}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <CheckCircle2 className="mb-2 h-5 w-5 text-teal-700" />
            <p className="text-sm font-semibold text-gray-950">{planLimitLabel(plan)}</p>
            <p className="mt-1 text-xs text-gray-500">Included recruiter job posting quota</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <CalendarClock className="mb-2 h-5 w-5 text-teal-700" />
            <p className="text-sm font-semibold text-gray-950">{durationLabel(plan)}</p>
            <p className="mt-1 text-xs text-gray-500">Plan validity from successful payment</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(`/recruiter/subscription/checkout/${plan._id}`)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Review checkout
          </button>
          <button
            type="button"
            onClick={() => startPayment(plan)}
            disabled={payingPlanId === plan._id}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CreditCard className="h-4 w-4" />
            {payingPlanId === plan._id ? "Processing..." : "Pay with Razorpay"}
          </button>
        </div>
      </section>
    </div>
  );
}
