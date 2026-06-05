import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { jobsApi } from "../../../../api/api";
import { useNavigate } from "react-router-dom";
import {
  HiPlus,
  HiBriefcase,
  HiCheckCircle,
  HiClock,
  HiUsers,
  HiSearch,
  HiX,
  HiLocationMarker,
  HiCurrencyDollar,
  HiUserGroup,
  HiAcademicCap,
  HiDocumentText,
  HiCalendar,
  HiOutlineInformationCircle,
  HiEye,
  HiPencil,
  HiTrash
} from "react-icons/hi";
import { GiDiamondRing } from "react-icons/gi";
import { FaCheckCircle } from "react-icons/fa";
import {
  getDisplayJobStatus,
  getJobExpiryDate,
  isExpiredJob,
} from "../../../../utils/jobVisibility";

export default function PostedJobs() {
  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const loggedUser = useSelector((state) => state.auth.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProfession, setFilterProfession] = useState("all");
  const [filterEmpType, setFilterEmpType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const fetchJobsByRecruiter = async () => {
    try {
      setLoading(true);
      const res = await jobsApi.get(`/recruiter/${loggedUser._id}`);
      setPostedJobs(res.data.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;

    try {
      await jobsApi.delete(`/${jobId}`);
      setPostedJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Failed to delete job");
      setTimeout(() => setDeleteError(""), 5000);
    }
  };

  const handleStatusUpdate = async (jobId, status) => {
    try {
      const response = await jobsApi.put(`/${jobId}`, { status });
      setPostedJobs((prevJobs) =>
        prevJobs.map((job) => (job._id === jobId ? response.data.job || { ...job, status } : job))
      );
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Failed to update job status");
      setTimeout(() => setDeleteError(""), 5000);
    }
  };

  const formatSalaryDisplay = (job) => {
    if (!job.salary) return "Not specified";

    const parts = [];
    Object.entries(job.salary).forEach(([type, range]) => {
      if (range.min || range.max) {
        const minStr = range.min ? `₹${Number(range.min).toLocaleString('en-IN')}` : '';
        const maxStr = range.max ? `₹${Number(range.max).toLocaleString('en-IN')}` : '';
        const rangeStr = minStr && maxStr ? `${minStr} - ${maxStr}` : (minStr || maxStr);
        const typeLabel = type === 'perPiece' ? 'Per Piece' : type;
        parts.push(`${typeLabel}: ${rangeStr}`);
      }
    });
    return parts.length > 0 ? parts.join(' • ') : 'Not specified';
  };

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...postedJobs];

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.jobLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.jobProfession?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterEmpType !== "all") {
      filtered = filtered.filter((job) => job.empType === filterEmpType);
    }

    if (filterProfession !== "all") {
      filtered = filtered.filter((job) => job.jobProfession === filterProfession);
    }

    if (filterType !== "all") {
      filtered = filtered.filter((job) => job.jobType === filterType);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((job) => getDisplayJobStatus(job) === filterStatus);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "openings":
          return (b.openings || 0) - (a.openings || 0);
        case "deadline":
          return new Date(getJobExpiryDate(a) || 0) - new Date(getJobExpiryDate(b) || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [postedJobs, searchTerm, filterType, filterStatus, filterProfession, filterEmpType, sortBy]);

  const professions = useMemo(() => {
    const profs = new Set();
    postedJobs.forEach(job => job.jobProfession && profs.add(job.jobProfession));
    return Array.from(profs);
  }, [postedJobs]);

  useEffect(() => {
    if (loggedUser?._id) fetchJobsByRecruiter();
  }, [loggedUser?._id]);

  const stats = useMemo(() => {
    const total = postedJobs.length;
    const active = postedJobs.filter((job) => getDisplayJobStatus(job) === "active").length;
    const expired = postedJobs.filter((job) => getDisplayJobStatus(job) === "expired").length;
    const totalOpenings = postedJobs.reduce((sum, job) => sum + (job.openings || 0), 0);
    const jobsWithSalary = postedJobs.filter(job => {
      return job.salary && Object.values(job.salary).some(type => type.min || type.max);
    }).length;

    return {
      total,
      active,
      expired,
      totalOpenings,
      jobsWithSalary
    };
  }, [postedJobs]);

  if (!loggedUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <GiDiamondRing className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Please Login</h2>
          <p className="text-sm text-gray-500 mb-6">Login to view your posted jobs</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm shadow-sm hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - matching dashboard gradient */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm mb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                  <GiDiamondRing className="text-yellow-300 text-2xl" />
                  Your Posted Jobs
                </h1>
                <p className="text-blue-100 text-sm">Manage and track all your jewelry industry job postings</p>
              </div>

              <button
                onClick={() => navigate("/recruiter/company/jobpost")}
                className="px-4 py-2 rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition font-medium flex items-center gap-2 shadow-lg text-sm"
              >
                <HiPlus className="text-lg" />
                Post New Job
              </button>
            </div>
          </div>
        </div>
        {/* Success/Error Messages */}
        {deleteSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <FaCheckCircle className="text-green-500 text-lg" />
            <p className="text-sm text-green-700 font-medium">Job deleted successfully!</p>
          </div>
        )}

        {deleteError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <HiOutlineInformationCircle className="text-red-500 text-lg" />
            <p className="text-sm text-red-700 font-medium">{deleteError}</p>
          </div>
        )}

        {/* Stats Cards - matching dashboard StatCard style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatsCard
            label="Total Jobs"
            value={stats.total}
            icon={<HiBriefcase />}
            color="blue"
          />
          <StatsCard
            label="Active Jobs"
            value={stats.active}
            icon={<HiCheckCircle />}
            color="green"
          />
          <StatsCard
            label="Expired Jobs"
            value={stats.expired}
            icon={<HiClock />}
            color="red"
          />
          <StatsCard
            label="Total Openings"
            value={stats.totalOpenings}
            icon={<HiUsers />}
            color="purple"
          />
          <StatsCard
            label="With Salary"
            value={stats.jobsWithSalary}
            icon={<HiCurrencyDollar />}
            color="orange"
          />
        </div>

        {/* Filters Bar - matching dashboard card style */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Search Jobs</label>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search by title, company, profession..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Profession</label>
              <select
                value={filterProfession}
                onChange={(e) => setFilterProfession(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Professions</option>
                {professions.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Employment Type</label>
              <select
                value={filterEmpType}
                onChange={(e) => setFilterEmpType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Internship /Trainee">Internship / Trainee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="openings">Most Openings</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || filterProfession !== "all" || filterStatus !== "all" || filterEmpType !== "all") && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">Active filters:</span>
              {searchTerm && <FilterBadge label={`Search: "${searchTerm}"`} onRemove={() => setSearchTerm("")} />}
              {filterProfession !== "all" && <FilterBadge label={`Profession: ${filterProfession}`} onRemove={() => setFilterProfession("all")} />}
              {filterEmpType !== "all" && <FilterBadge label={`Type: ${filterEmpType}`} onRemove={() => setFilterEmpType("all")} />}
              {filterStatus !== "all" && <FilterBadge label={`Status: ${filterStatus}`} onRemove={() => setFilterStatus("all")} />}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterProfession("all");
                  setFilterEmpType("all");
                  setFilterStatus("all");
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{filteredAndSortedJobs.length}</span> of{" "}
            <span className="font-semibold text-gray-700">{postedJobs.length}</span> jobs
          </p>
        </div>

        {/* Loading State - matching dashboard skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-5/6 mb-4"></div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="h-8 bg-gray-100 rounded"></div>
                  <div className="h-8 bg-gray-100 rounded"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-100 rounded w-1/3"></div>
                  <div className="h-8 bg-gray-100 rounded w-1/3"></div>
                  <div className="h-8 bg-gray-100 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedJobs.length > 0 ? (
              filteredAndSortedJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onDelete={handleDelete}
                  onStatusUpdate={handleStatusUpdate}
                  onEdit={() => navigate(`/recruiter/company/postedjobs/edit/${job._id}`)}
                  onView={() => navigate(`/recruiter/jobs/${job._id}`)}
                  formatSalary={formatSalaryDisplay}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <HiSearch className="text-5xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || filterProfession !== "all" || filterStatus !== "all" || filterEmpType !== "all"
                    ? "No jobs match your filters"
                    : "No jobs posted yet"}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {searchTerm || filterProfession !== "all" || filterStatus !== "all" || filterEmpType !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start by posting your first jewelry industry job"}
                </p>
                {(!searchTerm && filterProfession === "all" && filterStatus === "all" && filterEmpType === "all") && (
                  <button
                    onClick={() => navigate("/recruiter/company/jobpost")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium inline-flex items-center gap-2 text-sm shadow-sm"
                  >
                    <HiPlus className="text-lg" />
                    Post a Job
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon, color }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600",
    orange: "from-orange-500 to-orange-600",
    yellow: "from-yellow-500 to-yellow-600",
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

function FilterBadge({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium">
      {label}
      <button onClick={onRemove} className="hover:bg-blue-100 rounded-full p-0.5 transition">
        <HiX className="text-xs" />
      </button>
    </span>
  );
}

function JobCard({ job, onDelete, onEdit, onView, onStatusUpdate, formatSalary }) {
  const isExpired = isExpiredJob(job);
  const status = getDisplayJobStatus(job);
  const expiryDate = getJobExpiryDate(job);
  const applicantsCount = job.applicantsCount || job.applicationsCount || job.applicants?.length || 0;
  const daysAgo = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  const getActiveSalaryTypes = () => {
    if (!job.salary) return [];
    return Object.entries(job.salary)
      .filter(([_, range]) => range.min || range.max)
      .map(([type]) => type);
  };

  const activeSalaryTypes = getActiveSalaryTypes();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group">
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition truncate">
              {job.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">{job.companyName}</p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            {isExpired && (
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-lg font-medium">
                Expired
              </span>
            )}
          </div>
        </div>

        {/* Profession */}
        <div className="mb-3">
          <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
            {job.jobProfession || "Not specified"}
          </span>
          <span className="ml-2 inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
            {status}
          </span>
          <span className="ml-2 inline-block px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
            {job.approvalStatus || "Approved"}
          </span>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <InfoCard icon={<HiLocationMarker />} text={job.jobLocation} />
          <InfoCard icon={<HiUserGroup />} text={`${job.openings} openings`} />
          <InfoCard icon={<HiBriefcase />} text={job.empType} />
          <InfoCard icon={<HiAcademicCap />} text={job.experience} />
          <InfoCard icon={<HiUsers />} text={`${applicantsCount} applicants`} />
          <InfoCard icon={<HiDocumentText />} text={`Posted ${new Date(job.createdAt).toLocaleDateString()}`} />
        </div>

        {/* Salary Display */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-1 text-blue-700 mb-1">
            <HiCurrencyDollar className="text-sm" />
            <span className="text-xs font-medium">Salary:</span>
          </div>
          <p className="text-xs text-gray-700">{formatSalary(job)}</p>
          {activeSalaryTypes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {activeSalaryTypes.map(type => (
                <span key={type} className="text-xs px-2 py-0.5 bg-white text-blue-600 rounded-lg">
                  {type === 'perPiece' ? 'Per Piece' : type}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Skills Preview */}
        {job.skills && job.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1.5">Required Skills:</p>
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg">
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg">
                  +{job.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Deadline */}
        {expiryDate && (
          <div className={`text-xs mb-3 flex items-center gap-1.5 ${isExpired ? "text-red-600" : "text-gray-500"}`}>
            <HiCalendar className="text-xs" />
            <span className="font-medium">{isExpired ? "Expired" : "Expiry date"}:</span>
            {new Date(expiryDate).toLocaleDateString()}
          </div>
        )}

        {/* Posted Time */}
        <div className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
          <HiClock className="text-xs" />
          Posted {daysAgo === 0 ? "today" : `${daysAgo} days ago`}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            onClick={onView}
            className="flex items-center justify-center gap-1 bg-gray-50 text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-100 transition text-xs border border-gray-200"
            title="View Job"
          >
            <HiEye className="text-sm" />
            <span className="hidden sm:inline text-xs">View</span>
          </button>
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition text-xs shadow-sm"
            title="Edit Job"
          >
            <HiPencil className="text-sm" />
            <span className="hidden sm:inline text-xs">Edit</span>
          </button>
          <button
            onClick={() => onDelete(job._id)}
            className="flex items-center justify-center gap-1 bg-red-50 text-red-600 font-medium py-2 rounded-lg hover:bg-red-100 transition text-xs border border-red-200"
            title="Delete Job"
          >
            <HiTrash className="text-sm" />
            <span className="hidden sm:inline text-xs">Delete</span>
          </button>
          <button
            onClick={() => onStatusUpdate(job._id, status === "active" ? "paused" : "active")}
            className="flex items-center justify-center gap-1 bg-amber-50 text-amber-700 font-medium py-2 rounded-lg hover:bg-amber-100 transition text-xs border border-amber-200"
            title={status === "active" ? "Pause Job" : "Reopen Job"}
          >
            <HiClock className="text-sm" />
            <span className="hidden sm:inline text-xs">{status === "active" ? "Pause" : "Open"}</span>
          </button>
          {status !== "closed" && (
            <button
              onClick={() => onStatusUpdate(job._id, "closed")}
              className="flex items-center justify-center gap-1 bg-slate-50 text-slate-700 font-medium py-2 rounded-lg hover:bg-slate-100 transition text-xs border border-slate-200"
              title="Close Job"
            >
              <HiX className="text-sm" />
              <span className="hidden sm:inline text-xs">Close</span>
            </button>
          )}
          {isExpired && (
            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-1 bg-green-50 text-green-700 font-medium py-2 rounded-lg hover:bg-green-100 transition text-xs border border-green-200 sm:col-span-2"
              title="Renew or Repost Job"
            >
              <HiPlus className="text-sm" />
              <span className="hidden sm:inline text-xs">Renew/Repost</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, text }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 p-1.5 rounded-lg">
      <span className="text-gray-400 text-sm">{icon}</span>
      <span className="truncate text-xs">{text}</span>
    </div>
  );
}
