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
      <div className="jc-soft-page flex min-h-96 items-center justify-center">
        <RefreshCw className="h-10 w-10 animate-spin text-[#5d0f51]" />
      </div>
    );
  }

  return (
    <div className="jc-soft-page min-h-screen p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-[#261723] sm:text-3xl">Subscription Plans</h1>
        <p className="mt-2 text-sm text-[#7b6575]">Choose a recruiter plan before posting jobs.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <article key={plan._id} className="jc-panel flex h-full flex-col p-5">
            <div>
              <h2 className="text-xl font-bold text-[#261723]">{plan.planName}</h2>
              <p className="mt-2 text-3xl font-bold text-[#5d0f51]">{formatCurrency(plan.price)}</p>
              <p className="mt-2 text-sm text-[#7b6575]">{plan.description}</p>
            </div>

            <div className="mt-5 space-y-3 text-sm text-[#4b3444]">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#5d0f51]" />
                {planLimitLabel(plan)}
              </p>
              <p className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-[#5d0f51]" />
                {durationLabel(plan)}
              </p>
            </div>

            <div className="mt-auto grid gap-2 pt-6 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate(`/recruiter/subscription/plans/${plan._id}`)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d9bdcf] bg-white px-4 py-2 text-sm font-semibold text-[#5d0f51] hover:bg-[#fff7fb]"
              >
                <Eye className="h-4 w-4" />
                Details
              </button>
              <button
                type="button"
                onClick={() => startPayment(plan)}
                disabled={payingPlanId === plan._id}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5d0f51] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3f0b38] disabled:cursor-not-allowed disabled:opacity-60"
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
