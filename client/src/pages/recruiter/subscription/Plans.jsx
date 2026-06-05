import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, CheckCircle2, CreditCard, Eye, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { subscriptionApi } from "../../../api/api";
import useSubscriptionPayment from "./useSubscriptionPayment";
import { durationLabel, formatCurrency, planLimitLabel } from "./subscriptionUtils";

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { payingPlanId, startPayment } = useSubscriptionPayment();

  useEffect(() => {
    let active = true;

    subscriptionApi
      .get("/plans")
      .then((response) => {
        if (active) setPlans(response.data?.data || []);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Unable to load subscription plans.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <RefreshCw className="h-10 w-10 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">Subscription Plans</h1>
        <p className="mt-2 text-sm text-gray-600">Choose a recruiter plan before posting jobs.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan._id} className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-gray-950">{plan.planName}</h2>
              <p className="mt-2 text-3xl font-bold text-teal-800">{formatCurrency(plan.price)}</p>
              <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
            </div>

            <div className="mt-5 space-y-3 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-700" />
                {planLimitLabel(plan)}
              </p>
              <p className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-teal-700" />
                {durationLabel(plan)}
              </p>
            </div>

            <div className="mt-auto grid gap-2 pt-6 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate(`/recruiter/subscription/plans/${plan._id}`)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
                Details
              </button>
              <button
                type="button"
                onClick={() => startPayment(plan)}
                disabled={payingPlanId === plan._id}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CreditCard className="h-4 w-4" />
                {payingPlanId === plan._id ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
