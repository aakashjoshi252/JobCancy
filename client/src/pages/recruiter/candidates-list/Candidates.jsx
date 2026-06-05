import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { applicationApi } from "../../../api/api";
import { useNavigate } from "react-router-dom";
import { HiUserGroup, HiMail, HiDocumentText, HiOfficeBuilding, HiSearch } from "react-icons/hi";
import UserAvatar from "../../../components/ui/UserAvatar";

export default function CandidatesList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loggedUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const fetchCandidates = async () => {
    try {
      const res = await applicationApi.get(`/recruiter/${loggedUser._id}`);
      setApplications(res.data.data || res.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedUser?._id) {
      fetchCandidates();
    }
  }, [loggedUser]);

  const filteredApplications = applications.filter(app => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.candidateId?.username?.toLowerCase().includes(term) ||
      app.jobId?.title?.toLowerCase().includes(term) ||
      app.status?.toLowerCase().includes(term)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Selected":
      case "Shortlisted":
      case "Reviewed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Loading State
  if (loading) {
    return <CandidatesSkeleton />;
  }

  // Empty State
  if (applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiUserGroup className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Candidates Yet</h3>
            <p className="text-sm text-gray-500">
              No candidates have applied to your jobs yet. Share your job postings to start receiving applications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Matching Dashboard Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <HiUserGroup className="text-yellow-300" />
                Applicants List
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Manage and review candidate applications
              </p>
            </div>
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search by name, job, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Total Applications"
            value={applications.length}
            icon={<HiDocumentText />}
            color="blue"
          />
          <StatCard
            label="Pending Review"
            value={applications.filter(a => a.status === "Pending").length}
            icon={<HiSearch />}
            color="yellow"
          />
          <StatCard
            label="Shortlisted"
            value={applications.filter(a => a.status === "Shortlisted" || a.status === "Selected").length}
            icon={<HiUserGroup />}
            color="green"
          />
        </div>

        {/* Results Count */}
        {searchTerm && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{filteredApplications.length}</span> of{" "}
              <span className="font-semibold text-gray-700">{applications.length}</span> candidates
            </p>
          </div>
        )}

        {/* Candidates Grid */}
        <div className="grid gap-4">
          {filteredApplications.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <UserAvatar user={app.candidateId} className="h-10 w-10 text-sm" />
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {app.candidateId?.username || "Unknown Candidate"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Applied for: <span className="font-medium text-gray-700">{app.jobId?.title}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span
                      className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <HiDocumentText className="text-sm" />
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => navigate('/chat', { state: { userId: app.candidateId?._id } })}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-sm flex items-center gap-1"
                  >
                    <HiMail className="text-sm" />
                    Message
                  </button>

                  <button
                    onClick={() => navigate(`/recruiter/candidates-list/${app._id}`)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredApplications.length === 0 && searchTerm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <HiSearch className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No candidates match your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component - Matching Dashboard
function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-sm`}>
          <span className="text-base sm:text-lg">{icon}</span>
        </div>
      </div>
      <div className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className="text-xs text-gray-600 font-medium">{label}</div>
    </div>
  );
}

// Skeleton Loader
function CandidatesSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32 sm:h-40 animate-pulse"></div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 -mt-10 sm:-mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 sm:h-5 bg-gray-200 rounded w-12 mb-1"></div>
              <div className="h-3 bg-gray-100 rounded w-16"></div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 animate-pulse">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-gray-100 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-5 bg-gray-100 rounded w-20 mt-2"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
