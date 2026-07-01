import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Download,
  Eye,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/api";
import { PageHeader, PageShell } from "../../components/layout/PageShell";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

const initialFilters = {
  search: "",
  role: "",
  status: "",
  suspicious: "",
  country: "",
  dateFrom: "",
  dateTo: "",
};

const formatDateTime = (value) => {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const locationLabel = (activity) =>
  [activity.city, activity.region, activity.country].filter(Boolean).join(", ") || "Unknown location";

const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function LoginActivityCard({ activity, onView, onDelete }) {
  return (
    <article className="min-w-0 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#E9D5FF] bg-[#F5ECFF] px-2.5 py-1 text-xs font-semibold capitalize text-[#6B21A8]">
              {activity.role || "unknown"}
            </span>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
              activity.status === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}>
              {activity.status}
            </span>
            {activity.suspicious && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                Suspicious
              </span>
            )}
          </div>
          <h2 className="mt-3 break-words text-base font-semibold text-[#1F2937]">
            {activity.email || activity.userId?.email || "Unknown user"}
          </h2>
          <p className="mt-1 break-words text-sm text-[#6B7280]">
            {activity.browser} on {activity.os} - {activity.ipAddress}
          </p>
        </div>
        <p className="text-sm text-[#6B7280] sm:text-right">{formatDateTime(activity.loginTime)}</p>
      </div>

      <div className="mt-4 flex min-w-0 items-start gap-2 rounded-lg bg-[#FFF7F3] p-3 text-sm text-[#6B7280]">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#6B21A8]" aria-hidden="true" />
        <span className="break-words">{locationLabel(activity)}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => onView(activity)}>
          <Eye className="h-4 w-4" aria-hidden="true" />
          Details
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(activity)}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete
        </Button>
      </div>
    </article>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg bg-[#FFF7F3] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#1F2937]">{value || "Not available"}</p>
    </div>
  );
}

export default function LoginActivity() {
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const pageStats = useMemo(() => ({
    total: activities.length,
    suspicious: activities.filter((activity) => activity.suspicious).length,
    failed: activities.filter((activity) => activity.status === "failed").length,
  }), [activities]);

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setDraftFilters((current) => ({ ...current, [name]: value }));
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
      };
      const response = await adminApi.get("/login-activity", { params });
      setActivities(response.data?.data || []);
      setPagination(response.data?.pagination || { page, pages: 1, total: 0 });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load login activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setFilters(draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
    setPage(1);
  };

  const exportCsv = () => {
    const header = [
      "Email",
      "Role",
      "Status",
      "Suspicious",
      "IP Address",
      "Browser",
      "OS",
      "Device",
      "City",
      "Region",
      "Country",
      "ISP",
      "Login Time",
      "Reason",
    ];
    const rows = activities.map((activity) => [
      activity.email || activity.userId?.email,
      activity.role,
      activity.status,
      activity.suspicious ? "Yes" : "No",
      activity.ipAddress,
      activity.browser,
      activity.os,
      activity.device,
      activity.city,
      activity.region,
      activity.country,
      activity.isp,
      activity.loginTime,
      activity.reason,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `login-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteActivity = async (activity) => {
    if (!window.confirm("Delete this login activity record?")) return;

    try {
      await adminApi.delete(`/login-activity/${activity._id}`);
      toast.success("Login activity deleted");
      fetchActivities();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete login activity");
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Admin security"
        title="Login activity"
        description="Audit successful and failed logins by role, email, IP address, approximate location, and suspicious login signals."
        actions={
          <>
            <Button variant="secondary" onClick={fetchActivities} disabled={loading}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </Button>
            <Button variant="secondary" onClick={exportCsv} disabled={!activities.length}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Export CSV
            </Button>
          </>
        }
      />

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <ShieldCheck className="h-5 w-5 text-[#6B21A8]" aria-hidden="true" />
          <p className="mt-2 text-2xl font-bold text-[#1F2937]">{pagination.total || 0}</p>
          <p className="text-sm text-[#6B7280]">Total matching records</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-amber-700" aria-hidden="true" />
          <p className="mt-2 text-2xl font-bold text-[#1F2937]">{pageStats.suspicious}</p>
          <p className="text-sm text-amber-800">Suspicious on this page</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <Filter className="h-5 w-5 text-red-700" aria-hidden="true" />
          <p className="mt-2 text-2xl font-bold text-[#1F2937]">{pageStats.failed}</p>
          <p className="text-sm text-red-800">Failed attempts on this page</p>
        </div>
      </div>

      <form onSubmit={applyFilters} className="mb-5 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-semibold text-[#1F2937]">
            Search email or IP
            <div className="mt-2 flex h-11 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-[#E9D5FF]">
              <Search className="h-4 w-4 text-[#6B7280]" aria-hidden="true" />
              <input
                name="search"
                value={draftFilters.search}
                onChange={updateFilter}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder="Email, IP, city, browser"
              />
            </div>
          </label>
          <label className="text-sm font-semibold text-[#1F2937]">
            Role
            <select name="role" value={draftFilters.role} onChange={updateFilter} className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#E9D5FF]">
              <option value="">All roles</option>
              <option value="candidate">Candidate</option>
              <option value="recruiter">Recruiter</option>
              <option value="admin">Admin</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-[#1F2937]">
            Status
            <select name="status" value={draftFilters.status} onChange={updateFilter} className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#E9D5FF]">
              <option value="">All statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-[#1F2937]">
            Suspicious
            <select name="suspicious" value={draftFilters.suspicious} onChange={updateFilter} className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#E9D5FF]">
              <option value="">All</option>
              <option value="true">Suspicious only</option>
              <option value="false">Not suspicious</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-[#1F2937]">
            Country
            <input name="country" value={draftFilters.country} onChange={updateFilter} className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#E9D5FF]" />
          </label>
          <label className="text-sm font-semibold text-[#1F2937]">
            From
            <input name="dateFrom" type="date" value={draftFilters.dateFrom} onChange={updateFilter} className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#E9D5FF]" />
          </label>
          <label className="text-sm font-semibold text-[#1F2937]">
            To
            <input name="dateTo" type="date" value={draftFilters.dateTo} onChange={updateFilter} className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#E9D5FF]" />
          </label>
          <div className="flex items-end gap-2">
            <Button type="submit" className="flex-1">
              Apply
            </Button>
            <Button variant="secondary" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>
      </form>

      <div className="space-y-3 lg:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-lg border border-[#E5E7EB] bg-white" />
          ))
        ) : activities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-white p-8 text-center text-sm text-[#6B7280]">
            No login activity found.
          </div>
        ) : (
          activities.map((activity) => (
            <LoginActivityCard key={activity._id} activity={activity} onView={setSelectedActivity} onDelete={deleteActivity} />
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white shadow-sm lg:block">
        <table className="min-w-full divide-y divide-[#E5E7EB] text-sm">
          <thead className="bg-[#FFF7F3] text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Device</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {loading ? (
              <tr><td className="px-4 py-8 text-center text-[#6B7280]" colSpan="8">Loading login activity...</td></tr>
            ) : activities.length === 0 ? (
              <tr><td className="px-4 py-8 text-center text-[#6B7280]" colSpan="8">No login activity found.</td></tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity._id} className="align-top hover:bg-[#FFF7F3]">
                  <td className="max-w-[16rem] break-words px-4 py-3 font-semibold text-[#1F2937]">{activity.email || activity.userId?.email || "Unknown"}</td>
                  <td className="px-4 py-3 capitalize text-[#6B7280]">{activity.role}</td>
                  <td className="max-w-[10rem] break-words px-4 py-3 text-[#6B7280]">{activity.ipAddress}</td>
                  <td className="max-w-[14rem] break-words px-4 py-3 text-[#6B7280]">{activity.browser} on {activity.os}</td>
                  <td className="max-w-[16rem] break-words px-4 py-3 text-[#6B7280]">{locationLabel(activity)}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{formatDateTime(activity.loginTime)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="capitalize text-[#1F2937]">{activity.status}</span>
                      {activity.suspicious && <span className="text-xs font-semibold text-amber-700">Suspicious</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setSelectedActivity(activity)} aria-label="View details">
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => deleteActivity(activity)} aria-label="Delete activity">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#6B7280]">
          Page {pagination.page || page} of {pagination.pages || 1}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>
            Previous
          </Button>
          <Button variant="secondary" disabled={page >= (pagination.pages || 1) || loading} onClick={() => setPage((current) => current + 1)}>
            Next
          </Button>
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedActivity)}
        title="Login activity details"
        onClose={() => setSelectedActivity(null)}
      >
        {selectedActivity && (
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Email" value={selectedActivity.email || selectedActivity.userId?.email} />
            <DetailItem label="Role" value={selectedActivity.role} />
            <DetailItem label="Status" value={selectedActivity.status} />
            <DetailItem label="Suspicious" value={selectedActivity.suspicious ? "Yes" : "No"} />
            <DetailItem label="IP address" value={selectedActivity.ipAddress} />
            <DetailItem label="Device" value={selectedActivity.device} />
            <DetailItem label="Browser" value={selectedActivity.browser} />
            <DetailItem label="Operating system" value={selectedActivity.os} />
            <DetailItem label="Location" value={locationLabel(selectedActivity)} />
            <DetailItem label="Timezone" value={selectedActivity.timezone} />
            <DetailItem label="ISP/org" value={selectedActivity.isp} />
            <DetailItem label="Login time" value={formatDateTime(selectedActivity.loginTime)} />
            <DetailItem label="Logout time" value={formatDateTime(selectedActivity.logoutTime)} />
            <DetailItem label="Coordinates" value={
              selectedActivity.latitude && selectedActivity.longitude
                ? `${selectedActivity.latitude}, ${selectedActivity.longitude}`
                : "Not available"
            } />
            <div className="sm:col-span-2">
              <DetailItem label="Reason" value={selectedActivity.reason || "No suspicious reason recorded"} />
            </div>
          </div>
        )}
      </Modal>
    </PageShell>
  );
}
