import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  BadgeIndianRupee,
  CheckCircle2,
  Download,
  Edit3,
  FileClock,
  Plus,
  RefreshCw,
  Save,
  Users,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { adminApi } from "../../api/api";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDate = (date) => (date ? new Date(date).toLocaleDateString("en-IN") : "-");

const emptyPlan = {
  planName: "",
  price: "",
  jobPostLimit: "",
  duration: 1,
  durationType: "month",
  isUnlimited: false,
  isActive: true,
  description: "",
  sortOrder: 0,
};

const downloadCsv = (rows) => {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "subscription-report.csv";
  link.click();
  URL.revokeObjectURL(url);
};

export default function Subscriptions() {
  const { t } = useTranslation(["subscription"]);
  const [data, setData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planForm, setPlanForm] = useState(emptyPlan);
  const [editingPlanId, setEditingPlanId] = useState("");

  const report = data?.report || {};
  const subscriptions = data?.subscriptions || [];
  const transactions = data?.transactions || [];
  const usageLogs = data?.usageLogs || [];

  const loadData = async () => {
    try {
      setLoading(true);
      const [subscriptionsRes, plansRes] = await Promise.all([
        adminApi.get("/subscriptions"),
        adminApi.get("/subscription-plans"),
      ]);
      setData(subscriptionsRes.data.data || null);
      setPlans(plansRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rowsForExport = useMemo(
    () => [
      ["Recruiter", "Email", "Plan", "Status", "Start", "End", "Jobs Used", "Remaining"],
      ...subscriptions.map((subscription) => [
        subscription.recruiterId?.username,
        subscription.recruiterId?.email,
        subscription.planId?.planName,
        subscription.status,
        formatDate(subscription.startDate),
        formatDate(subscription.endDate),
        subscription.jobsPostedCount,
        subscription.isUnlimited ? "Unlimited" : subscription.remainingPosts,
      ]),
    ],
    [subscriptions]
  );

  const handlePlanSubmit = async (event) => {
    event.preventDefault();
    try {
      setSavingPlan(true);
      const payload = {
        ...planForm,
        price: Number(planForm.price),
        jobPostLimit: planForm.isUnlimited ? 0 : Number(planForm.jobPostLimit),
        duration: Number(planForm.duration),
        sortOrder: Number(planForm.sortOrder || 0),
      };

      if (editingPlanId) {
        await adminApi.patch(`/subscription-plans/${editingPlanId}`, payload);
        toast.success("Plan updated");
      } else {
        await adminApi.post("/subscription-plans", payload);
        toast.success("Plan created");
      }

      setPlanForm(emptyPlan);
      setEditingPlanId("");
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save plan");
    } finally {
      setSavingPlan(false);
    }
  };

  const editPlan = (plan) => {
    setEditingPlanId(plan._id);
    setPlanForm({
      planName: plan.planName || "",
      price: plan.price || "",
      jobPostLimit: plan.jobPostLimit || "",
      duration: plan.duration || 1,
      durationType: plan.durationType || "month",
      isUnlimited: Boolean(plan.isUnlimited),
      isActive: Boolean(plan.isActive),
      description: plan.description || "",
      sortOrder: plan.sortOrder || 0,
    });
  };

  const togglePlan = async (plan) => {
    try {
      await adminApi.patch(`/subscription-plans/${plan._id}`, { isActive: !plan.isActive });
      toast.success(plan.isActive ? "Plan disabled" : "Plan enabled");
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update plan");
    }
  };

  const updateSubscriptionStatus = async (subscription, status) => {
    try {
      await adminApi.patch(`/subscriptions/${subscription._id}`, { status });
      toast.success("Subscription updated");
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update subscription");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <RefreshCw className="h-10 w-10 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
            {t("subscription:admin.title", { defaultValue: "Subscriptions" })}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {t("subscription:admin.subtitle", {
              defaultValue: "Revenue, recruiter plans, payment transactions, and usage audit trail.",
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadCsv(rowsForExport)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700"
        >
          <Download className="h-4 w-4" />
          {t("subscription:admin.export", { defaultValue: "Export CSV" })}
        </button>
      </div>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={<BadgeIndianRupee />} label={t("subscription:admin.revenue", { defaultValue: "Revenue" })} value={formatCurrency(report.totalRevenue)} />
        <Metric icon={<BadgeIndianRupee />} label={t("subscription:admin.mrr", { defaultValue: "Monthly Revenue" })} value={formatCurrency(report.monthlyRecurringRevenue)} />
        <Metric icon={<CheckCircle2 />} label={t("subscription:admin.active", { defaultValue: "Active" })} value={report.activeSubscriptions || 0} />
        <Metric icon={<FileClock />} label={t("subscription:admin.expired", { defaultValue: "Expired" })} value={report.expiredSubscriptions || 0} />
        <Metric icon={<XCircle />} label={t("subscription:admin.paymentFailures", { defaultValue: "Payment Failures" })} value={report.paymentFailures || 0} />
      </section>

      <section className="mb-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={handlePlanSubmit} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-700" />
            <h2 className="text-lg font-bold text-gray-950">
              {editingPlanId
                ? t("subscription:admin.editPlan", { defaultValue: "Edit Plan" })
                : t("subscription:admin.createPlan", { defaultValue: "Create Plan" })}
            </h2>
          </div>

          <div className="grid gap-3">
            <input
              required
              value={planForm.planName}
              onChange={(event) => setPlanForm({ ...planForm, planName: event.target.value })}
              placeholder="Plan name"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                type="number"
                min="0"
                value={planForm.price}
                onChange={(event) => setPlanForm({ ...planForm, price: event.target.value })}
                placeholder="Price"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                disabled={planForm.isUnlimited}
                value={planForm.jobPostLimit}
                onChange={(event) => setPlanForm({ ...planForm, jobPostLimit: event.target.value })}
                placeholder="Job limit"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                type="number"
                min="1"
                value={planForm.duration}
                onChange={(event) => setPlanForm({ ...planForm, duration: event.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <select
                value={planForm.durationType}
                onChange={(event) => setPlanForm({ ...planForm, durationType: event.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="month">Month</option>
                <option value="months">Months</option>
                <option value="year">Year</option>
              </select>
            </div>
            <input
              value={planForm.description}
              onChange={(event) => setPlanForm({ ...planForm, description: event.target.value })}
              placeholder="Description"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={planForm.isUnlimited}
                  onChange={(event) => setPlanForm({ ...planForm, isUnlimited: event.target.checked })}
                />
                Unlimited
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={planForm.isActive}
                  onChange={(event) => setPlanForm({ ...planForm, isActive: event.target.checked })}
                />
                Active
              </label>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              disabled={savingPlan}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {t("subscription:admin.savePlan", { defaultValue: "Save Plan" })}
            </button>
            {editingPlanId && (
              <button
                type="button"
                onClick={() => {
                  setEditingPlanId("");
                  setPlanForm(emptyPlan);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-950">
            {t("subscription:admin.plans", { defaultValue: "Plans" })}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {plans.map((plan) => (
              <div key={plan._id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-950">{plan.planName}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatCurrency(plan.price)} - {plan.isUnlimited ? "Unlimited" : `${plan.jobPostLimit} jobs/month`}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${plan.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {plan.isActive ? "Active" : "Disabled"}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => editPlan(plan)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    {t("subscription:admin.editPlan", { defaultValue: "Edit Plan" })}
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePlan(plan)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700"
                  >
                    {plan.isActive
                      ? t("subscription:admin.disable", { defaultValue: "Disable" })
                      : t("subscription:admin.enable", { defaultValue: "Enable" })}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-950">
          {t("subscription:admin.subscriptions", { defaultValue: "Subscriptions" })}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="py-3">{t("subscription:admin.recruiter", { defaultValue: "Recruiter" })}</th>
                <th className="py-3">Plan</th>
                <th className="py-3">Status</th>
                <th className="py-3">{t("subscription:admin.endDate", { defaultValue: "End Date" })}</th>
                <th className="py-3">{t("subscription:admin.jobsUsed", { defaultValue: "Jobs Used" })}</th>
                <th className="py-3">{t("subscription:admin.manualStatus", { defaultValue: "Manual Status" })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscriptions.map((subscription) => (
                <tr key={subscription._id}>
                  <td className="py-3">
                    <p className="font-medium text-gray-950">{subscription.recruiterId?.username}</p>
                    <p className="text-xs text-gray-500">{subscription.recruiterId?.email}</p>
                  </td>
                  <td className="py-3">{subscription.planId?.planName}</td>
                  <td className="py-3 capitalize">{subscription.status}</td>
                  <td className="py-3">{formatDate(subscription.endDate)}</td>
                  <td className="py-3">
                    {subscription.jobsPostedCount || 0}
                    {subscription.isUnlimited ? " / Unlimited" : ` / ${subscription.jobPostLimit}`}
                  </td>
                  <td className="py-3">
                    <select
                      value={subscription.status}
                      onChange={(event) => updateSubscriptionStatus(subscription, event.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="pending">Pending</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <TablePanel title={t("subscription:admin.transactions", { defaultValue: "Transactions" })}>
          <table className="min-w-[680px] w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="py-3">Recruiter</th>
                <th className="py-3">Plan</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Status</th>
                <th className="py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="py-3">{transaction.recruiterId?.email}</td>
                  <td className="py-3">{transaction.planId?.planName}</td>
                  <td className="py-3">{formatCurrency(transaction.amount)}</td>
                  <td className="py-3 capitalize">{transaction.status}</td>
                  <td className="py-3">{formatDate(transaction.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablePanel>

        <TablePanel title={t("subscription:admin.usageLogs", { defaultValue: "Usage Logs" })}>
          <table className="min-w-[680px] w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="py-3">Recruiter</th>
                <th className="py-3">Job</th>
                <th className="py-3">Plan</th>
                <th className="py-3">Month</th>
                <th className="py-3">Counted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usageLogs.map((usage) => (
                <tr key={usage._id}>
                  <td className="py-3">{usage.recruiterId?.email}</td>
                  <td className="py-3">{usage.jobId?.title}</td>
                  <td className="py-3">{usage.planId?.planName}</td>
                  <td className="py-3">{usage.monthKey}</td>
                  <td className="py-3">{formatDate(usage.countedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablePanel>
      </section>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-700" />
          <h2 className="text-lg font-bold text-gray-950">
            {t("subscription:admin.subscribers", { defaultValue: "Subscribers" })}
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {(report.planWiseSubscribers || []).map((item) => (
            <div key={item.planId} className="rounded-lg bg-gray-50 p-4">
              <p className="font-semibold text-gray-950">{item.planName}</p>
              <p className="mt-2 text-2xl font-bold text-blue-700">{item.subscribers}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        {icon}
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
    </div>
  );
}

function TablePanel({ title, children }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-950">{title}</h2>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}
