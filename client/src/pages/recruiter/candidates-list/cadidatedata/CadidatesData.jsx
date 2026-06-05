import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { applicationApi } from "../../../../api/api";
import {
  HiUser,
  HiMail,
  HiPhone,
  HiCalendar,
  HiBriefcase,
  HiLocationMarker,
  HiAcademicCap,
  HiDocumentText,
  HiArrowLeft,
  HiDownload,
  HiStar,
  HiCheckCircle
} from "react-icons/hi";
import UserAvatar from "../../../../components/ui/UserAvatar";

export default function CandidateProfile() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ================= FETCH PROFILE =================
  const fetchCandidateProfile = async (applicationId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await applicationApi.get(`/candidate-data/${applicationId}`);
      setCandidate(res.data.candidateData || res.data.data?.candidate);
      setResume(res.data.resumeData || res.data.data?.resume);
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError("Failed to load candidate profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateProfile(applicationId);
  }, [applicationId]);

  // Loading State
  if (loading) {
    return <CandidateProfileSkeleton />;
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <HiUser className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => fetchCandidateProfile(applicationId)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No Data State
  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <HiDocumentText className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Candidate Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">The requested candidate profile does not exist.</p>
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
                onClick={() => navigate(-1)}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition"
              >
                <HiArrowLeft className="text-xl text-white" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Candidate Profile</h1>
                <p className="text-blue-100 text-sm mt-0.5">View complete candidate information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {/* ================= HEADER CARD ================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <UserAvatar user={candidate} className="h-14 w-14 text-xl" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{candidate.username}</h2>
                    <p className="text-sm text-gray-500">{candidate.email}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <HiCalendar className="text-xs" />
                      Joined {new Date(candidate.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/recruiter/candidates-list")}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium flex items-center gap-2"
                >
                  <HiArrowLeft className="text-sm" />
                  Back to List
                </button>
              </div>
            </div>
          </div>

          {/* ================= BASIC INFO ================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <HiUser className="text-blue-600" />
                Candidate Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={<HiMail />} label="Email" value={candidate.email} />
                <InfoRow icon={<HiPhone />} label="Phone" value={candidate.phone || "Not provided"} />
                <InfoRow icon={<HiBriefcase />} label="Role" value={candidate.role || "Candidate"} />
                <InfoRow icon={<HiCalendar />} label="Member Since" value={new Date(candidate.createdAt).toLocaleDateString()} />
              </div>
            </div>
          </div>

          {/* ================= RESUME DETAILS ================= */}
          {resume && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <HiDocumentText className="text-blue-600" />
                  Resume Details
                </h3>

                <div className="mb-4">
                  <p className="text-lg font-semibold text-gray-900">{resume.fullName || candidate.username}</p>
                  <p className="text-sm text-gray-600">{resume.jobTitle || "Professional"}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <InfoRow label="Experience" value={resume.experience ? `${resume.experience} years` : "Not specified"} />
                  <InfoRow icon={<HiLocationMarker />} label="Location" value={resume.location || "Not specified"} />
                </div>

                {resume.summary && (
                  <div className="mb-4 pt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Professional Summary</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {resume.summary}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {resume.skills?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <HiStar className="text-sm text-blue-600" />
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume Link */}
                {resume.fileUrl && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
                    >
                      <HiDownload className="text-sm" />
                      Download Resume
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= EDUCATION ================= */}
          {resume?.education?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <HiAcademicCap className="text-blue-600" />
                  Education
                </h3>
                <div className="space-y-3">
                  {resume.education.map((edu, idx) => (
                    <div key={idx} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                      <p className="font-semibold text-gray-900 text-sm">{edu.degree}</p>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      <p className="text-xs text-gray-400">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Back Button Footer */}
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

// Helper Component
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
function CandidateProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32 sm:h-40 animate-pulse"></div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 -mt-10 sm:-mt-12">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-64"></div>
                  <div className="h-3 bg-gray-100 rounded w-32 mt-2"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-10 bg-gray-100 rounded"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
