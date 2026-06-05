import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Gauge, ListChecks, RefreshCw, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { subscriptionApi } from "../../../api/api";
import { formatCurrency, formatDate, planLimitLabel } from "./subscriptionUtils";

export default function SubscriptionDetails() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    subscriptionApi
      .get("/my-subscription")
      .then((response) => {
        if (active) setData(response.data?.data || null);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Unable to load subscription details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const usage = data?.usage;
  const subscription = data?.activeSubscription || data?.latestSubscription;
  const usagePercent = useMemo(() => {
    if (!usage || usage.isUnlimited) return 0;
    return Math.min(Math.max(usage.usagePercent || 0, 0), 100);
  }, [usage]);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <RefreshCw className="h-10 w-10 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-teal-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">Subscription Details</h1>
          <p className="mt-1 text-sm text-gray-600">Current plan, payment, validity, and posting usage.</p>
        </div>
      </div>

      {!subscription ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-800">
          No active subscription was found.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold text-gray-950">Plan Information</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Plan" value={subscription.planId?.planName || subscription.planSnapshot?.planName} />
              <Field label="Status" value={subscription.status} />
              <Field label="Amount" value={formatCurrency(subscription.planId?.price || subscription.planSnapshot?.price)} />
              <Field label="Quota" value={planLimitLabel(subscription)} />
              <Field label="Start date" value={formatDate(subscription.startDate)} icon={<CalendarClock className="h-4 w-4" />} />
              <Field label="End date" value={formatDate(subscription.endDate)} icon={<CalendarClock className="h-4 w-4" />} />
              <Field label="Order ID" value={subscription.orderId} mono />
              <Field label="Payment ID" value={subscription.paymentId} mono />
            </div>
          </section>

          <aside className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Gauge className="h-5 w-5 text-teal-700" />
              <h2 className="text-lg font-bold text-gray-950">Usage</h2>
            </div>
            {usage?.isUnlimited ? (
              <div className="rounded-lg bg-teal-50 p-4 text-teal-900">
                <p className="font-bold">Unlimited posting</p>
                <p className="mt-1 text-sm">Total posts used: {usage.totalUsed || 0}</p>
              </div>
            ) : (
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Monthly posts</span>
                  <span className="font-bold text-gray-950">
                    {usage?.usedThisMonth || 0}/{subscription.jobPostLimit || 0}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-3 rounded-full bg-teal-700" style={{ width: `${usagePercent}%` }} />
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <ListChecks className="h-4 w-4" />
                  {usage?.remainingPosts || 0} posts remaining
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono = false, icon = null }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      {icon && <div className="mb-2 text-teal-700">{icon}</div>}
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className={`mt-1 break-words text-sm font-bold capitalize text-gray-950 ${mono ? "font-mono normal-case" : ""}`}>
        {value || "-"}
      </p>
    </div>
  );
}
