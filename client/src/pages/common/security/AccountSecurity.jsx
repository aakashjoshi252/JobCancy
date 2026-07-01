import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  AlertTriangle,
  Clock3,
  Globe2,
  Info,
  LogOut,
  MapPin,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { userApi } from "../../../api/api";
import { PageHeader, PageShell } from "../../../components/layout/PageShell";
import Button from "../../../components/ui/Button";

const formatDateTime = (value) => {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getLocationLabel = (activity) =>
  [activity.city, activity.region, activity.country].filter(Boolean).join(", ") || "Unknown location";

const statusStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
};

function ActivityCard({ activity }) {
  const statusClass = statusStyles[activity.status] || "border-gray-200 bg-gray-50 text-gray-700";

  return (
    <article className="min-w-0 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClass}`}>
              {activity.status || "unknown"}
            </span>
            {activity.suspicious && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                Suspicious
              </span>
            )}
          </div>
          <h2 className="mt-3 break-words text-base font-semibold text-[#1F2937]">
            {activity.browser || "Unknown browser"} on {activity.os || "Unknown OS"}
          </h2>
          <p className="mt-1 break-words text-sm text-[#6B7280]">{activity.device || activity.deviceType}</p>
        </div>
        <div className="text-sm text-[#6B7280] sm:text-right">
          <div className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-[#8B5CF6]" aria-hidden="true" />
            {formatDateTime(activity.loginTime || activity.createdAt)}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex min-w-0 gap-2 rounded-lg bg-[#FFF7F3] p-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#6B21A8]" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-semibold text-[#1F2937]">Approximate location</p>
            <p className="break-words text-[#6B7280]">{getLocationLabel(activity)}</p>
          </div>
        </div>
        <div className="flex min-w-0 gap-2 rounded-lg bg-[#FDE8E4] p-3">
          <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-[#6B21A8]" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-semibold text-[#1F2937]">IP address</p>
            <p className="break-words text-[#6B7280]">{activity.maskedIpAddress || activity.ipAddress || "Hidden"}</p>
          </div>
        </div>
      </div>

      {activity.reason && (
        <p className="mt-3 break-words rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {activity.reason}
        </p>
      )}
    </article>
  );
}

export default function AccountSecurity() {
  const user = useSelector((state) => state.auth.user);
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const suspiciousCount = useMemo(
    () => activities.filter((activity) => activity.suspicious).length,
    [activities]
  );

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const response = await userApi.get("/security/login-history", {
        params: {
          page,
          limit: 10,
          ...(status ? { status } : {}),
        },
      });
      setActivities(response.data?.data || []);
      setPagination(response.data?.pagination || { page, pages: 1, total: 0 });
      setMeta(response.data?.meta || null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load login activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Account security"
        title="Login activity"
        description="Review recent sign-ins, devices, approximate locations, and suspicious login markers for your account."
        actions={
          <Button variant="secondary" onClick={fetchActivity} disabled={loading}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#6B21A8]" aria-hidden="true" />
            <p className="text-sm font-semibold text-[#1F2937]">Security logs</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#1F2937]">{pagination.total || 0}</p>
          <p className="text-sm text-[#6B7280]">Retained for {meta?.retentionDays || 180} days</p>
        </div>
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <p className="text-sm font-semibold text-[#1F2937]">Suspicious on this page</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#1F2937]">{suspiciousCount}</p>
          <p className="text-sm text-[#6B7280]">New device, city, country, or unusual pattern</p>
        </div>
        <div className="rounded-lg border border-[#E9D5FF] bg-[#FFF7F3] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-[#6B21A8]" aria-hidden="true" />
            <p className="text-sm font-semibold text-[#1F2937]">Privacy notice</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            {meta?.privacyLabel || "Approximate location based on IP address"}. This is not live GPS tracking.
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <label className="min-w-0 text-sm font-semibold text-[#1F2937]">
          Filter activity
          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#E9D5FF] sm:w-48"
          >
            <option value="">All activity</option>
            <option value="success">Successful logins</option>
            <option value="failed">Failed attempts</option>
          </select>
        </label>

        <div className="flex min-w-0 items-center gap-3 rounded-lg bg-[#FDE8E4] p-3 text-sm text-[#6B7280]">
          <MonitorSmartphone className="h-5 w-5 shrink-0 text-[#6B21A8]" aria-hidden="true" />
          <span className="break-words">
            Signed in as {user?.email || "your account"}. IP addresses are partially masked in this view.
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-lg border border-[#E5E7EB] bg-white" />
          ))
        ) : activities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-white p-8 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-[#A78BFA]" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold text-[#1F2937]">No login activity found</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Your recent security events will appear here.</p>
          </div>
        ) : (
          activities.map((activity) => <ActivityCard key={activity._id} activity={activity} />)
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#6B7280]">
          Page {pagination.page || page} of {pagination.pages || 1}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={page >= (pagination.pages || 1) || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-[#E5E7EB] bg-white p-4 text-sm text-[#6B7280] shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-semibold text-[#1F2937]">Session controls</p>
            <p className="mt-1 break-words">Logout-all-devices requires server-side token revocation, which is not enabled in the current JWT session model.</p>
          </div>
          <Button variant="secondary" disabled title="Token revocation is not enabled">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout all devices
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
