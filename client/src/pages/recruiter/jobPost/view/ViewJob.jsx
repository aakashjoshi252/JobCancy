import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { jobsApi } from "../../../../api/api";
import { 
  HiBriefcase, 
  HiLocationMarker, 
  HiCurrencyDollar, 
  HiUserGroup, 
  HiAcademicCap,
  HiClock, 
  HiCalendar, 
  HiMail, 
  HiGlobe,
  HiDocumentText,
  HiOutlineInformationCircle,
  HiChevronLeft,
  HiPencil,
  HiTrash,
  HiShare,
  HiPrinter,
  HiEye,
  HiEyeOff
} from "react-icons/hi";
import { GiDiamondRing } from "react-icons/gi";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function ViewJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showExpiredWarning, setShowExpiredWarning] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobsApi.get(`/${jobId}`);
      const jobData = response.data;
      
      const isJobExpired = jobData.deadline && new Date(jobData.deadline) < new Date();
      
      if (isJobExpired) {
        setShowExpiredWarning(true);
      }
      
      setJob(jobData);
    } catch (error) {
      console.error("Error fetching job:", error);
      setError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;

    try {
      await jobsApi.delete(`/${jobId}`);
      setDeleteSuccess(true);
      setTimeout(() => {
        navigate("/recruiter/company/postedjobs");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete job");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatSalary = () => {
    if (!job?.salary) return [];

    const parts = [];
    Object.entries(job.salary).forEach(([type, range]) => {
      if (range.min || range.max) {
        const minStr = range.min ? `₹${Number(range.min).toLocaleString('en-IN')}` : '';
        const maxStr = range.max ? `₹${Number(range.max).toLocaleString('en-IN')}` : '';
        const rangeStr = minStr && maxStr ? `${minStr} - ${maxStr}` : (minStr || maxStr);
        const typeLabel = type === 'perPiece' ? 'Per Piece' : type.charAt(0).toUpperCase() + type.slice(1);
        parts.push({ type, label: typeLabel, range: rangeStr, min: range.min, max: range.max });
      }
    });
    return parts;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isExpired = job?.deadline && new Date(job.deadline) < new Date();
  const daysAgo = job?.createdAt 
    ? Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const daysUntilDeadline = job?.deadline && !isExpired
    ? Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) {
    return <JobDetailsSkeleton />;
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <HiOutlineInformationCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Job Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">{error || "The job you're looking for doesn't exist or has been removed."}</p>
          <button
            onClick={() => navigate("/recruiter/company/postedjobs")}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium inline-flex items-center gap-2 shadow-sm"
          >
            <HiChevronLeft />
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const salaryParts = formatSalary();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Expired Job Warning Banner */}
      {showExpiredWarning && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-yellow-500 text-lg" />
              <div className="flex-1">
                <p className="text-sm text-yellow-700 font-medium">This job posting has expired</p>
                <p className="text-xs text-yellow-600">Applications are no longer being accepted for this position.</p>
              </div>
              <button
                onClick={() => setShowExpiredWarning(false)}
                className="text-yellow-500 hover:text-yellow-700 transition"
              >
                <HiEyeOff className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Share Job</h3>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
                >
                  {copySuccess ? "Copied!" : "Copy"}
                </button>
              </div>
              {copySuccess && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <FaCheckCircle className="w-3 h-3" /> Link copied to clipboard!
                </p>
              )}
              <button
                onClick={() => setShowShareModal(false)}
                className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Message */}
      {deleteSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 shadow-lg animate-slideIn">
          <FaCheckCircle className="text-green-500 text-lg" />
          <p className="text-sm text-green-700 font-medium">Job deleted successfully! Redirecting...</p>
        </div>
      )}

      {/* Header */}
      <div className={`bg-gradient-to-r ${isExpired ? 'from-gray-600 to-gray-700' : 'from-blue-600 to-blue-700'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <button
            onClick={() => navigate("/recruiter/company/postedjobs")}
            className="mb-4 text-blue-200 hover:text-white transition flex items-center gap-2 text-sm"
          >
            <HiChevronLeft />
            Back to Jobs
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <GiDiamondRing className="text-yellow-300 text-2xl" />
              Job Details
            </h1>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowShareModal(true)}
                className="px-3 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition flex items-center gap-2 text-sm font-medium"
                disabled={isExpired}
              >
                <HiShare className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition flex items-center gap-2 text-sm font-medium"
              >
                <HiPrinter className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => navigate(`/recruiter/company/postedjobs/edit/${job._id}`)}
                className="px-3 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <HiPencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <HiTrash className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Expired Job Notice */}
        {isExpired && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-lg" />
              <div>
                <p className="text-sm text-red-700 font-medium">This job posting has expired</p>
                <p className="text-xs text-red-600">Posted on {formatDate(job.createdAt)} • Deadline was {formatDate(job.deadline)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Title & Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                  <p className="text-sm text-gray-600">{job.companyName}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {isExpired ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium flex items-center gap-1">
                      <HiEyeOff className="text-xs" />
                      Expired
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium flex items-center gap-1">
                      <HiEye className="text-xs" />
                      Active
                    </span>
                  )}
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <HiClock className="text-xs" />
                    Posted {daysAgo === 0 ? "today" : `${daysAgo} days ago`}
                  </span>
                  {!isExpired && daysUntilDeadline > 0 && (
                    <span className="text-xs text-orange-600 flex items-center gap-1">
                      <HiCalendar className="text-xs" />
                      {daysUntilDeadline} days left to apply
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-gray-100">
                <QuickInfo 
                  icon={<HiLocationMarker />} 
                  label="Location" 
                  value={job.jobLocation} 
                />
                <QuickInfo 
                  icon={<HiBriefcase />} 
                  label="Employment Type" 
                  value={job.empType} 
                />
                <QuickInfo 
                  icon={<HiAcademicCap />} 
                  label="Experience" 
                  value={job.experience} 
                />
                <QuickInfo 
                  icon={<HiUserGroup />} 
                  label="Openings" 
                  value={job.openings} 
                />
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HiDocumentText className="text-blue-600 text-lg" />
                Job Description
              </h3>
              <div className="prose max-w-none text-sm text-gray-700 whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* Additional Requirements */}
            {job.additionalRequirement && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Additional Requirements</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.additionalRequirement}</p>
              </div>
            )}

            {/* Required Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Salary Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HiCurrencyDollar className="text-blue-600 text-lg" />
                Salary Details
              </h3>
              {salaryParts.length > 0 ? (
                <div className="space-y-3">
                  {salaryParts.map((part, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">{part.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-lg ${
                          part.type === 'monthly' ? 'bg-green-100 text-green-700' :
                          part.type === 'hourly' ? 'bg-blue-100 text-blue-700' :
                          part.type === 'perPiece' ? 'bg-purple-100 text-purple-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {part.label}
                        </span>
                      </div>
                      <p className="text-base font-bold text-blue-600">{part.range}</p>
                      {part.min && part.max && (
                        <p className="text-xs text-gray-500 mt-1">
                          Range: ₹{Number(part.min).toLocaleString('en-IN')} - ₹{Number(part.max).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No salary details specified</p>
              )}
            </div>

            {/* Profession & Specialization */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Profession & Specialization</h3>
              <div className="mb-4">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Job Profession</label>
                <p className="text-sm text-gray-900 font-medium mt-1">{job.jobProfession || "Not specified"}</p>
              </div>
              {job.jewelrySpecialization && job.jewelrySpecialization.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Specializations</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.jewelrySpecialization.map((spec, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Company Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Company Information</h3>
              <div className="space-y-3">
                <CompanyInfo 
                  icon={<HiBriefcase />} 
                  label="Company Name" 
                  value={job.companyName} 
                />
                <CompanyInfo 
                  icon={<HiMail />} 
                  label="Email" 
                  value={job.companyEmail} 
                />
                <CompanyInfo 
                  icon={<HiLocationMarker />} 
                  label="Address" 
                  value={job.companyAddress} 
                />
                {job.companyWebsite && (
                  <CompanyInfo 
                    icon={<HiGlobe />} 
                    label="Website" 
                    value={job.companyWebsite}
                    isLink 
                  />
                )}
                {job.companyDescription && (
                  <div className="pt-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">About Company</label>
                    <p className="text-sm text-gray-700 mt-1">{job.companyDescription}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Important Dates */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HiCalendar className="text-blue-600 text-lg" />
                Important Dates
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Posted On</label>
                  <p className="text-sm text-gray-900 font-medium mt-1">{formatDate(job.createdAt)}</p>
                </div>
                {job.deadline && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Application Deadline</label>
                    <p className={`text-sm font-medium mt-1 ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(job.deadline)}
                      {isExpired && <span className="ml-2 text-xs text-red-600">(Expired)</span>}
                      {!isExpired && daysUntilDeadline <= 3 && daysUntilDeadline > 0 && (
                        <span className="ml-2 text-xs text-orange-600">(Closing soon!)</span>
                      )}
                    </p>
                  </div>
                )}
                {job.updatedAt && job.updatedAt !== job.createdAt && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Last Updated</label>
                    <p className="text-sm text-gray-600 mt-1">{formatDate(job.updatedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Application Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Application Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Applications</span>
                  <span className="text-xl font-bold text-blue-600">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Review</span>
                  <span className="text-sm font-semibold text-gray-900">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Shortlisted</span>
                  <span className="text-sm font-semibold text-gray-900">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rejected</span>
                  <span className="text-sm font-semibold text-gray-900">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Bottom */}
        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate("/recruiter/company/postedjobs")}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
          >
            Back to Jobs
          </button>
          <button
            onClick={() => navigate(`/recruiter/company/postedjobs/edit/${job._id}`)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 shadow-sm text-sm"
          >
            <HiPencil className="w-4 h-4" />
            Edit Job
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// Helper Components
function QuickInfo({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-blue-600 mt-0.5 text-sm">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xs sm:text-sm font-medium text-gray-900">{value || "Not specified"}</p>
      </div>
    </div>
  );
}

function CompanyInfo({ icon, label, value, isLink }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-500 mt-0.5 text-sm">{icon}</span>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        {isLink ? (
          <a 
            href={value.startsWith('http') ? value : `https://${value}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium break-all"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-gray-900 font-medium break-all">{value || "Not specified"}</p>
        )}
      </div>
    </div>
  );
}

// Job Details Skeleton - Matching Dashboard Skeleton
function JobDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-40 animate-pulse"></div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-6"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-3 bg-gray-100 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full"></div>
                <div className="h-3 bg-gray-100 rounded w-11/12"></div>
                <div className="h-3 bg-gray-100 rounded w-4/5"></div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-5 bg-gray-200 rounded w-28 mb-4"></div>
              <div className="h-4 bg-gray-100 rounded w-24"></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-20"></div>
                <div className="h-3 bg-gray-100 rounded w-28"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}