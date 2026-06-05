import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Briefcase, ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import { adminApi } from "../../api/api";
import UserAvatar from "../../components/ui/UserAvatar";

const STATUSES = ["", "Pending", "Reviewing", "Shortlisted", "Interviewed", "Selected", "Accepted", "Rejected"];

export default function ApplicationManagement() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get("/applications", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          ...(search && { search }),
          ...(status && { status }),
        },
      });
      setApplications(response.data.data || []);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [pagination.page, status]);

  const changePage = (page) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.min(Math.max(page, 1), Math.max(prev.pages, 1)),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Application Pipeline</h1>
        <p className="text-gray-600">Review candidate movement across recruiter jobs.</p>
      </div>

      <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && fetchApplications()}
              placeholder="Search candidate, recruiter, job, or company"
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            {STATUSES.map((item) => (
              <option key={item || "all"} value={item}>
                {item || "All statuses"}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              fetchApplications();
            }}
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="mx-auto mb-4 h-14 w-14 text-gray-300" />
            <p className="text-lg font-semibold text-gray-900">No applications found</p>
            <p className="mt-1 text-gray-500">Try another status or search term.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Candidate</th>
                    <th className="px-5 py-3">Job</th>
                    <th className="px-5 py-3">Recruiter</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={application.candidateId} className="h-10 w-10 text-sm" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">{application.candidateId?.username || "Candidate"}</p>
                            <p className="truncate text-sm text-gray-500">{application.candidateId?.email}</p>
                            <p className="mt-1 truncate text-xs text-blue-600">{application.candidateId?.jobProfession}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{application.jobId?.title || "Deleted job"}</p>
                        <p className="text-sm text-gray-500">{application.companyId?.companyName || application.jobId?.companyName}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={application.recruiterId} className="h-9 w-9 text-xs" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">{application.recruiterId?.username || "Recruiter"}</p>
                            <p className="truncate text-sm text-gray-500">{application.recruiterId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {application.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                {pagination.total} applications
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changePage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="rounded-md border border-gray-300 bg-white p-2 text-gray-600 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {Math.max(pagination.pages, 1)}
                </span>
                <button
                  type="button"
                  onClick={() => changePage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="rounded-md border border-gray-300 bg-white p-2 text-gray-600 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
