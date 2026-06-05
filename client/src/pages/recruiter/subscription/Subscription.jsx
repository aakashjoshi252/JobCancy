import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  BadgeIndianRupee,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileClock,
  Gauge,
  History,
  Infinity as InfinityIcon,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { subscriptionApi } from "../../../api/api";
import useSubscriptionPayment from "./useSubscriptionPayment";
import { formatCurrency, formatDate } from "./subscriptionUtils";

const planLimitLabel = (plan, t) =>
  plan.isUnlimited
    ? t("subscription:unlimitedPosts", { defaultValue: "Unlimited posts" })
    : t("subscription:jobsPerMonth", {
        count: plan.jobPostLimit,
        defaultValue: "{{count}} jobs/month",
      });

const durationLabel = (plan, t) => {
  if (plan.durationType === "year") {
    return t("subscription:durationYear", { count: plan.duration, defaultValue: "{{count}} year" });
  }

  return t("subscription:durationMonths", { count: plan.duration, defaultValue: "{{count}} month" });
};

export default function Subscription() {
  const { t } = useTranslation(["subscription", "common"]);
  const [plans, setPlans] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);

  const usage = subscriptionData?.usage;
  const activeSubscription = subscriptionData?.activeSubscription;
  const currentPlanId = activeSubscription?.planId?._id || activeSubscription?.planId;
  const billingHistory = subscriptionData?.billingHistory || [];

  const usagePercent = useMemo(() => {
    if (!usage || usage.isUnlimited) return 0;
    return Math.min(Math.max(usage.usagePercent || 0, 0), 100);
  }, [usage]);

  const fetchSubscription = async () => {
    const [plansRes, subRes, transactionsRes] = await Promise.all([
      subscriptionApi.get("/plans"),
      subscriptionApi.get("/my-subscription"),
      subscriptionApi.get("/transactions"),
    ]);
    const nextSubscriptionData = subRes.data.data || null;
    setPlans(plansRes.data.data || []);
    setSubscriptionData({
      ...nextSubscriptionData,
      billingHistory: transactionsRes.data.data || nextSubscriptionData?.billingHistory || [],
    });
  };

  const { payingPlanId, startPayment } = useSubscriptionPayment({
    onVerified: fetchSubscription,
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const [plansRes, subRes, transactionsRes] = await Promise.all([
          subscriptionApi.get("/plans"),
          subscriptionApi.get("/my-subscription"),
          subscriptionApi.get("/transactions"),
        ]);

        if (!active) return;
        const nextSubscriptionData = subRes.data.data || null;
        setPlans(plansRes.data.data || []);
        setSubscriptionData({
          ...nextSubscriptionData,
          billingHistory: transactionsRes.data.data || nextSubscriptionData?.billingHistory || [],
        });
      } catch (error) {
        toast.error(error.response?.data?.message || t("subscription:loadFailed", { defaultValue: "Unable to load subscription" }));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [t]);

  const handleBuyPlan = async (planId) => {
    const selectedPlan = plans.find((plan) => plan._id === planId);

    if (!selectedPlan) {
      toast.error(t("subscription:planUnavailable", { defaultValue: "Selected plan is unavailable" }));
      return;
    }

    await startPayment(selectedPlan);
  };

  const handleCancel = async () => {
    if (!window.confirm(t("subscription:cancelConfirm", { defaultValue: "Cancel your active subscription?" }))) return;

    try {
      await subscriptionApi.post("/cancel");
      toast.success(t("subscription:cancelled", { defaultValue: "Subscription cancelled" }));
      await fetchSubscription();
    } catch (error) {
      toast.error(error.response?.data?.message || t("subscription:cancelFailed", { defaultValue: "Unable to cancel subscription" }));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <RefreshCw className="h-10 w-10 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
            {t("subscription:title", { defaultValue: "Subscription" })}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {t("subscription:subtitle", { defaultValue: "Manage job posting access and billing." })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/recruiter/subscription/plans"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Plans
          </Link>
          <Link
            to="/recruiter/subscription/details"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Details
          </Link>
          <Link
            to="/recruiter/subscription/history"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            History
          </Link>
          {activeSubscription && (
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4" />
              {t("subscription:cancelPlan", { defaultValue: "Cancel Plan" })}
            </button>
          )}
        </div>
      </div>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-700" />
            <h2 className="text-lg font-bold text-gray-950">
              {t("subscription:currentPlan", { defaultValue: "Current Plan" })}
            </h2>
          </div>

          {activeSubscription ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <Metric
                icon={<CreditCard className="h-5 w-5" />}
                label={t("subscription:plan", { defaultValue: "Plan" })}
                value={t(`subscription:plans.${activeSubscription.planId?.planName}.name`, {
                  defaultValue: activeSubscription.planId?.planName || activeSubscription.planSnapshot?.planName,
                })}
              />
              <Metric
                icon={<CalendarClock className="h-5 w-5" />}
                label={t("subscription:validUntil", { defaultValue: "Valid Until" })}
                value={formatDate(activeSubscription.endDate)}
              />
              <Metric
                icon={<FileClock className="h-5 w-5" />}
                label={t("subscription:status", { defaultValue: "Status" })}
                value={t(`subscription:statusLabels.${activeSubscription.status}`, {
                  defaultValue: activeSubscription.status,
                })}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
              {t("subscription:noActivePlan", { defaultValue: "No active subscription. Choose a plan to post jobs." })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Gauge className="h-5 w-5 text-teal-700" />
            <h2 className="text-lg font-bold text-gray-950">
              {t("subscription:usage", { defaultValue: "Usage" })}
            </h2>
          </div>

          {usage?.hasSubscription ? (
            usage.isUnlimited ? (
              <div className="flex items-center gap-3 rounded-lg bg-teal-50 p-4 text-teal-900">
                <InfinityIcon className="h-7 w-7" />
                <div>
                  <p className="text-sm font-semibold">{t("subscription:unlimitedPosts", { defaultValue: "Unlimited posts" })}</p>
                  <p className="text-xs text-teal-700">
                    {t("subscription:totalUsed", { count: usage.totalUsed, defaultValue: "{{count}} total posts" })}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {t("subscription:monthlyUsage", { defaultValue: "Monthly usage" })}
                  </span>
                  <span className="font-bold text-gray-950">
                    {usage.usedThisMonth}/{activeSubscription?.jobPostLimit || 0}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-3 rounded-full bg-teal-700" style={{ width: `${usagePercent}%` }} />
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  {t("subscription:remainingPosts", {
                    count: usage.remainingPosts,
                    defaultValue: "{{count}} posts remaining",
                  })}
                </p>
              </div>
            )
          ) : (
            <p className="text-sm text-gray-500">
              {t("subscription:usageUnavailable", { defaultValue: "Usage appears after a plan is active." })}
            </p>
          )}
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <BadgeIndianRupee className="h-5 w-5 text-teal-700" />
          <h2 className="text-xl font-bold text-gray-950">
            {t("subscription:choosePlan", { defaultValue: "Choose Plan" })}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article key={plan._id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-950">
                  {t(`subscription:plans.${plan.planName}.name`, { defaultValue: plan.planName })}
                </h3>
                <p className="mt-2 text-3xl font-bold text-teal-800">{formatCurrency(plan.price)}</p>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-700" />
                  {planLimitLabel(plan, t)}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-teal-700" />
                  {durationLabel(plan, t)}
                </p>
              </div>
              <button
                type="button"
                disabled={payingPlanId === plan._id}
                onClick={() => handleBuyPlan(plan._id)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CreditCard className="h-4 w-4" />
                {payingPlanId === plan._id
                  ? t("subscription:processing", { defaultValue: "Processing..." })
                  : activeSubscription
                    ? currentPlanId === plan._id
                      ? t("subscription:renew", { defaultValue: "Renew" })
                      : t("subscription:upgrade", { defaultValue: "Upgrade" })
                    : t("subscription:buyPlan", { defaultValue: "Buy Plan" })}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-teal-700" />
          <h2 className="text-xl font-bold text-gray-950">
            {t("subscription:billingHistory", { defaultValue: "Billing History" })}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="py-3">{t("subscription:plan", { defaultValue: "Plan" })}</th>
                <th className="py-3">{t("subscription:amount", { defaultValue: "Amount" })}</th>
                <th className="py-3">{t("subscription:paymentStatus", { defaultValue: "Payment Status" })}</th>
                <th className="py-3">{t("subscription:orderId", { defaultValue: "Order ID" })}</th>
                <th className="py-3">{t("subscription:date", { defaultValue: "Date" })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {billingHistory.length ? (
                billingHistory.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="py-3 font-medium text-gray-900">
                      {t(`subscription:plans.${transaction.planId?.planName}.name`, {
                        defaultValue: transaction.planId?.planName || "-",
                      })}
                    </td>
                    <td className="py-3">{formatCurrency(transaction.amount)}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        transaction.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : transaction.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}>
                        {t(`subscription:statusLabels.${transaction.status}`, {
                          defaultValue: transaction.status,
                        })}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-xs text-gray-500">{transaction.razorpayOrderId}</td>
                    <td className="py-3">{formatDate(transaction.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    {t("subscription:noBillingHistory", { defaultValue: "No billing history yet." })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-teal-700">{icon}</div>
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-base font-bold capitalize text-gray-950">{value || "-"}</p>
    </div>
  );
}
