import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { applicationApi } from "../../../../api/api";
import { HiUser, HiMail, HiPhone, HiCalendar, HiBriefcase, HiLocationMarker, HiCurrencyDollar, HiAcademicCap, HiDocumentText, HiArrowLeft } from "react-icons/hi";
import UserAvatar from "../../../../components/ui/UserAvatar";

export default function CandidateView() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [job, setJob] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCandidateData = async () => {
    if (!applicationId) return;

    try {
      setLoading(true);
      setError(null);
      const res = await applicationApi.get(`/candidate-data/${applicationId}`);
      setCandidate(res.data.candidateData || res.data.data?.candidate);
      setJob(res.data.jobData || res.data.data?.job);
      setApplication(res.data.application || res.data.data?.application);
    } catch (err) {
      console.error("Fetch candidate data error:", err);
      setError("Failed to load candidate data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateData();
  }, [applicationId]);

  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase();
    if (statusUpper === "APPROVED" || statusUpper === "SELECTED") {
      return "bg-green-100 text-green-800";
    }
    if (statusUpper === "REJECTED") {
      return "bg-red-100 text-red-800";
    }
    return "bg-yellow-100 text-yellow-800";
  };

  // Loading State
  if (loading) {
    return <CandidateViewSkeleton />;
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <HiUser className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={fetchCandidateData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No Data State
  if (!candidate || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <HiDocumentText className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Data Found</h2>
          <p className="text-sm text-gray-500 mb-6">Candidate or job information not available.</p>
          <button
            onClick={() => navigate("/recruiter/candidates-list")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm"
          >
            Back to Candidates
          </button>
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/recruiter/candidates-list")}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition"
              >
                <HiArrowLeft className="text-xl text-white" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Candidate Details</h1>
                <p className="text-blue-100 text-sm mt-0.5">Review candidate application and profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {/* ================= CANDIDATE CARD ================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <UserAvatar user={candidate} className="h-12 w-12 text-lg" />
                  <div>
                    <h3 className="text-base font-semibold text-gray-700">Candidate Profile</h3>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{candidate?.username}</h2>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/recruiter/candidates-list/candidate/${applicationId}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
                >
                  View Full Profile
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <InfoRow icon={<HiMail />} label="Email" value={candidate?.email} />
                <InfoRow icon={<HiPhone />} label="Phone" value={candidate?.phone || "N/A"} />
                <InfoRow
                  icon={<HiCalendar />}
                  label="Joined"
                  value={candidate?.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : "N/A"}
                />
                <InfoRow icon={<HiUser />} label="Role" value={candidate?.role || "Candidate"} />
              </div>
            </div>
          </div>

          {/* ================= JOB DETAILS ================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <HiBriefcase className="text-blue-600" />
                Applied Job
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Job Title" value={job?.title} />
                <InfoRow label="Company" value={job?.companyName || "N/A"} />
                <InfoRow icon={<HiLocationMarker />} label="Location" value={job?.jobLocation || "N/A"} />
                <InfoRow icon={<HiCurrencyDollar />} label="Salary" value={job?.salary ? "As per industry standard" : "N/A"} />
                <InfoRow icon={<HiAcademicCap />} label="Experience" value={job?.experience || "N/A"} />
              </div>
              {job?.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{job.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* ================= APPLICATION DETAILS ================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <HiDocumentText className="text-blue-600" />
                Application Details
              </h3>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(application?.status)}`}>
                    {application?.status || "PENDING"}
                  </span>
                </div>
                <InfoRow
                  label="Applied On"
                  value={application?.createdAt ? new Date(application.createdAt).toLocaleDateString() : "N/A"}
                />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {application?.coverLetter || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="flex justify-end">
            <button
              onClick={() => navigate("/recruiter/candidates-list")}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm flex items-center gap-2"
            >
              <HiArrowLeft className="text-sm" />
              Back to Candidates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-gray-400 text-sm mt-0.5">{icon}</span>}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-all">{value || "—"}</p>
      </div>
    </div>
  );
}

// Skeleton Loader
function CandidateViewSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32 sm:h-40 animate-pulse"></div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 -mt-10 sm:-mt-12">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                  <div className="h-5 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
