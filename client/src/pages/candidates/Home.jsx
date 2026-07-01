import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { dashboardApi, jobsApi, applicationApi } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { getCompanyDisplayName } from "../../utils/jobVisibility";
// import RecommendedJobs from "../../pages/candidates/JobCard/jobByProfession/JobProfession";
import { 
  HiChatAlt2, 
  HiBell, 
  HiDocumentText,
  HiClock,
  HiStar,
  HiCheckCircle,
  HiXCircle,
  HiSearch,
  HiClipboardList,
  HiCog,
  HiLightBulb,
  HiChevronRight,
  HiLocationMarker,
  HiCurrencyDollar,
  HiPlus
} from "react-icons/hi";

export default function CandidateHome() {
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format salary
  const formatSalary = (salary) => {
    if (!salary) return "Not specified";
    
    // Handle the new nested salary structure
    if (typeof salary === 'object') {
      const parts = [];
      
      if (salary.monthly?.min || salary.monthly?.max) {
        const min = salary.monthly.min ? `₹${salary.monthly.min.toLocaleString()}` : '';
        const max = salary.monthly.max ? `₹${salary.monthly.max.toLocaleString()}` : '';
        parts.push(`Monthly: ${min}${min && max ? ' - ' : ''}${max}`);
      }
      if (salary.hourly?.min || salary.hourly?.max) {
        const min = salary.hourly.min ? `₹${salary.hourly.min.toLocaleString()}` : '';
        const max = salary.hourly.max ? `₹${salary.hourly.max.toLocaleString()}` : '';
        parts.push(`Hourly: ${min}${min && max ? ' - ' : ''}${max}`);
      }
      if (salary.perPiece?.min || salary.perPiece?.max) {
        const min = salary.perPiece.min ? `₹${salary.perPiece.min.toLocaleString()}` : '';
        const max = salary.perPiece.max ? `₹${salary.perPiece.max.toLocaleString()}` : '';
        parts.push(`Per Piece: ${min}${min && max ? ' - ' : ''}${max}`);
      }
      if (salary.contract?.min || salary.contract?.max) {
        const min = salary.contract.min ? `₹${salary.contract.min.toLocaleString()}` : '';
        const max = salary.contract.max ? `₹${salary.contract.max.toLocaleString()}` : '';
        parts.push(`Contract: ${min}${min && max ? ' - ' : ''}${max}`);
      }
      
      return parts.length > 0 ? parts[0] : 'Not specified';
    }
    
    // Handle old format (single number)
    return `₹${Number(salary).toLocaleString()}`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [statsRes, jobsRes, applicationsRes] = await Promise.all([
          dashboardApi.get("/candidate", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          jobsApi.get("/candidate/recommended").catch(() => ({ data: { data: [] } })),
          applicationApi.get("/candidate").catch(() => ({ data: { data: [] } })),
        ]);

        setStats(statsRes.data.data);
        
        const jobs = jobsRes.data?.data || [];
        setRecommendedJobs(jobs.slice(0, 6));

        const apps = applicationsRes.data?.applications || applicationsRes.data?.data || [];
        setRecentApplications(apps.slice(0, 5));

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchDashboardData();
    }
  }, [token, user?._id]);

  if (loading) {
    return (
      <div className="jc-soft-page flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[#f0dce8] border-t-[#5d0f51]"></div>
          <p className="font-medium text-[#7b6575]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalApplications = stats?.totalApplications || 0;
  const successRate = totalApplications > 0 
    ? Math.round(((stats?.selected || 0) / totalApplications) * 100)
    : 0;

  return (
    <div className="jc-soft-page min-h-screen">
      {/* Header */}
      <div className="bg-[#4c0e42] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.username || 'Candidate'}!
              </h1>
              <p className="text-[#f4dcec]">Your job search journey continues</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/candidate/chat")}
                className="px-5 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition font-medium flex items-center gap-2"
              >
                <HiChatAlt2 className="text-xl" />
                Chats
              </button>

              <button
                onClick={() => navigate("/candidate/notifications")}
                className="px-5 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition font-medium flex items-center gap-2"
              >
                <HiBell className="text-xl" />
                Notifications
              </button>

              <button
                onClick={() => navigate("/candidate/resume")}
                className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-semibold text-[#5d0f51] shadow-lg transition hover:bg-[#fff7fb]"
              >
                <HiDocumentText className="text-xl" />
                My Resume
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 pb-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="Applied Jobs" value={totalApplications} icon={<HiClipboardList />} color="blue" />
          <StatCard title="Pending" value={stats?.pending || 0} icon={<HiClock />} color="yellow" />
          <StatCard title="Shortlisted" value={stats?.shortlisted || 0} icon={<HiStar />} color="purple" />
          <StatCard title="Selected" value={stats?.selected || 0} icon={<HiCheckCircle />} color="green" />
          <StatCard title="Rejected" value={stats?.rejected || 0} icon={<HiXCircle />} color="red" />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Applications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
                  <p className="text-sm text-gray-500 mt-1">Track your latest job applications</p>
                </div>
                <button
                  onClick={() => navigate("/candidate/applications")}
                  className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1"
                >
                  View All
                  <HiChevronRight />
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {recentApplications.length > 0 ? (
                  recentApplications.map((app) => (
                    <ApplicationRow key={app._id} application={app} navigate={navigate} />
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <HiClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-500 mb-6">Start applying to jobs that match your skills</p>
                    <button
                      onClick={() => navigate("/candidate/jobs")}
                      className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium inline-flex items-center gap-2"
                    >
                      <HiSearch />
                      Browse Jobs
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Jobs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
                <p className="text-sm text-gray-500 mt-1">Jobs matching your profile</p>
              </div>

              <div className="p-6">
                {recommendedJobs.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {recommendedJobs.map((job) => (
                      <button
                        key={job._id}
                        type="button"
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{job.title}</h3>
                            <p className="mt-1 text-sm text-gray-500">{getCompanyDisplayName(job, true)}</p>
                          </div>
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                            {job.empType}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <HiLocationMarker />
                            {job.jobLocation}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <HiCurrencyDollar />
                            {formatSalary(job.salary)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                    <p className="font-semibold text-gray-900">No matching jobs yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                      New jobs for {user?.jobProfession || "your profession"} will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Success Rate */}
            <div className="rounded-lg bg-[#4c0e42] p-6 text-white shadow-lg">
              <h3 className="text-lg font-bold mb-2">Success Rate</h3>
              <p className="mb-6 text-sm text-[#f4dcec]">Your application success metrics</p>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#f4dcec]">Success Rate</span>
                    <span className="font-bold text-2xl">{successRate}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-white/20">
                    <div className="bg-white h-3 rounded-full transition-all" style={{ width: `${successRate}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
                  <div>
                    <div className="mb-1 text-sm text-[#f4dcec]">Applied</div>
                    <div className="text-2xl font-bold">{totalApplications}</div>
                  </div>
                  <div>
                    <div className="mb-1 text-sm text-[#f4dcec]">Selected</div>
                    <div className="text-2xl font-bold">{stats?.selected || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <QuickActionButton icon={<HiSearch />} label="Browse All Jobs" onClick={() => navigate("/candidate/jobs")} />
                <QuickActionButton icon={<HiClipboardList />} label="My Applications" onClick={() => navigate("/candidate/applications")} />
                <QuickActionButton icon={<HiDocumentText />} label="Update Resume" onClick={() => navigate("/candidate/resume")} />
                <QuickActionButton icon={<HiCog />} label="Profile Settings" onClick={() => navigate("/candidate/settings")} />
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-lg border border-[#f0dce8] bg-[#fff7fb] p-6">
              <div className="flex items-start gap-3">
                <HiLightBulb className="flex-shrink-0 text-2xl text-[#5d0f51]" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Pro Tip</h4>
                  <p className="text-sm text-gray-600">
                    Complete your profile and upload an updated resume to increase your chances by 60%.
                  </p>
                </div>
              </div>
            </div>

            {/* Application Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Application Breakdown</h3>
              <div className="space-y-3">
                <ProgressBar label="Pending" value={stats?.pending || 0} total={totalApplications} color="yellow" />
                <ProgressBar label="Shortlisted" value={stats?.shortlisted || 0} total={totalApplications} color="purple" />
                <ProgressBar label="Selected" value={stats?.selected || 0} total={totalApplications} color="green" />
                <ProgressBar label="Rejected" value={stats?.rejected || 0} total={totalApplications} color="red" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="jc-panel p-5 transition hover:border-[#d5a6c7]">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#f7eef9] text-2xl text-[#5d0f51]">
        {icon}
      </div>
      <div className="text-3xl font-bold text-[#261723]">{value}</div>
      <div className="mt-1 text-sm font-medium text-[#7b6575]">{title}</div>
    </div>
  );
}

function ApplicationRow({ application, navigate }) {
  const job = application.job || application.jobId;
  const company = application.company || application.companyId;
  const daysAgo = Math.floor((Date.now() - new Date(application.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Reviewing: "bg-blue-100 text-blue-700",
    Shortlisted: "bg-purple-100 text-purple-700",
    Interviewed: "bg-indigo-100 text-indigo-700",
    Selected: "bg-green-100 text-green-700",
    Accepted: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition cursor-pointer" onClick={() => job?._id && navigate(`/jobs/${job._id}`)}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{job?.title || "Job Title"}</h3>
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusColors[application.status] || "bg-gray-100 text-gray-700"}`}>
              {application.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>{company?.companyName || "Company"}</span>
            <span className="text-gray-400">{daysAgo === 0 ? "Today" : `${daysAgo}d ago`}</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (job?._id) navigate(`/jobs/${job._id}`);
          }}
          className="ml-4 rounded-lg px-4 py-2 text-sm font-semibold text-[#5d0f51] transition hover:bg-[#fff7fb]"
        >
          View
        </button>
      </div>
    </div>
  );
}

function QuickActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-[#fff7fb]"
    >
      <span className="text-2xl text-[#7b6575] group-hover:text-[#5d0f51]">{icon}</span>
      <span className="font-medium text-[#4b3444] group-hover:text-[#261723]">{label}</span>
      <HiChevronRight className="ml-auto text-[#b697ad] group-hover:text-[#5d0f51]" />
    </button>
  );
}

function ProgressBar({ label, value, total, color }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  const colorClasses = {
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    red: "bg-red-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value} ({percentage}%)</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#f0dce8]">
        <div className={`${colorClasses[color]} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
