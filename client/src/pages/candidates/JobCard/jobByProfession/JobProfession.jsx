// src/components/candidates/jobs/RecommendedJobs.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { jobsApi } from "../../../api/api";
import { 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaClock,
  FaHeart,
  FaRegHeart,
  FaRupeeSign,
  FaRegClock
} from "react-icons/fa";
import { VscOrganization } from "react-icons/vsc";
import { GiJewelCrown } from "react-icons/gi";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { MdWork, MdLocationOn } from "react-icons/md";

export default function RecommendedJobs({ limit = 6, showViewAll = true }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [filter, setFilter] = useState("all"); // all, match, recent
  const [error, setError] = useState("");

  const userProfession = user?.jobProfession?.toLowerCase() || "";

  useEffect(() => {
    fetchRecommendedJobs();
  }, []);

  const fetchRecommendedJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsApi.get(`/`);
      const allJobs = response.data || [];

      // Score and sort jobs based on relevance to user's profession
      const scoredJobs = allJobs.map(job => {
        let score = 0;
        
        // Match by job title keywords from user's profession
        if (userProfession) {
          const professionKeywords = userProfession.split(' ').filter(k => k.length > 2);
          professionKeywords.forEach(keyword => {
            if (job.title?.toLowerCase().includes(keyword)) score += 10;
            if (job.description?.toLowerCase().includes(keyword)) score += 5;
            if (job.jobProfession?.toLowerCase().includes(keyword)) score += 8;
            if (job.jewelrySpecialization?.some(s => s.toLowerCase().includes(keyword))) score += 7;
          });
        }

        // Match by job profession
        if (job.jobProfession?.toLowerCase().includes(userProfession)) score += 15;

        // Match by specialization
        if (job.jewelrySpecialization?.some(s => 
          s.toLowerCase().includes(userProfession)
        )) score += 12;

        // Boost recent jobs
        const daysOld = job.createdAt ? 
          Math.floor((Date.now() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24)) : 30;
        if (daysOld < 7) score += 5;
        if (daysOld < 3) score += 3;

        return { ...job, relevanceScore: score };
      });

      // Filter out jobs with zero relevance if needed
      const relevantJobs = scoredJobs
        .filter(job => job.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit * 2); // Get more for filtering

      setJobs(relevantJobs);
    } catch (error) {
      console.error("Error fetching recommended jobs:", error);
      setError("Failed to load job recommendations");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredJobs = () => {
    switch (filter) {
      case "match":
        return jobs.filter(job => job.relevanceScore > 20).slice(0, limit);
      case "recent":
        return [...jobs]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, limit);
      default:
        return jobs.slice(0, limit);
    }
  };

  const toggleSaveJob = (jobId, e) => {
    e.stopPropagation();
    setSavedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const getDaysAgo = (date) => {
    if (!date) return "Recently";
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  // Updated formatSalary to handle the new nested salary structure
  const formatSalary = (salary) => {
    if (!salary) return null;
    
    // Handle the new nested salary structure
    if (typeof salary === 'object') {
      // Try to find the first salary type that has values
      if (salary.monthly?.min || salary.monthly?.max) {
        const min = salary.monthly.min ? `₹${salary.monthly.min.toLocaleString('en-IN')}` : '';
        const max = salary.monthly.max ? `₹${salary.monthly.max.toLocaleString('en-IN')}` : '';
        return min && max ? `${min} - ${max}/mo` : (min || max) + '/mo';
      }
      if (salary.hourly?.min || salary.hourly?.max) {
        const min = salary.hourly.min ? `₹${salary.hourly.min.toLocaleString('en-IN')}` : '';
        const max = salary.hourly.max ? `₹${salary.hourly.max.toLocaleString('en-IN')}` : '';
        return min && max ? `${min} - ${max}/hr` : (min || max) + '/hr';
      }
      if (salary.perPiece?.min || salary.perPiece?.max) {
        const min = salary.perPiece.min ? `₹${salary.perPiece.min.toLocaleString('en-IN')}` : '';
        const max = salary.perPiece.max ? `₹${salary.perPiece.max.toLocaleString('en-IN')}` : '';
        return min && max ? `${min} - ${max}/piece` : (min || max) + '/piece';
      }
      if (salary.contract?.min || salary.contract?.max) {
        const min = salary.contract.min ? `₹${salary.contract.min.toLocaleString('en-IN')}` : '';
        const max = salary.contract.max ? `₹${salary.contract.max.toLocaleString('en-IN')}` : '';
        return min && max ? `${min} - ${max} contract` : (min || max) + ' contract';
      }
      return null;
    }
    
    // Handle old format (single number) - fallback
    return `₹${Number(salary).toLocaleString('en-IN')}`;
  };

  const filteredJobs = getFilteredJobs();

  if (!userProfession) {
    return (
      <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
        <GiJewelCrown className="text-6xl text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Tell us your profession
        </h3>
        <p className="text-gray-600 mb-6">
          Add your job profession in your profile to get personalized job recommendations
        </p>
        <button
          onClick={() => navigate("/profile/edit")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Update Profile
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(limit).fill().map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredJobs.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
        <MdWork className="text-6xl text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No matching jobs found
        </h3>
        <p className="text-gray-600">
          We couldn't find any jobs matching "{userProfession}". Try checking back later or browse all jobs.
        </p>
        {showViewAll && (
          <button
            onClick={() => navigate("/candidate/jobs")}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Browse All Jobs
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Recommended for you
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Based on your profession: <span className="font-semibold text-blue-600">{userProfession}</span>
          </p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("match")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "match"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Best Match
          </button>
          <button
            onClick={() => setFilter("recent")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "recent"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Recent
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div
            key={job._id}
            onClick={() => navigate(`/candidate/jobs/${job._id}`)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-400 cursor-pointer group relative"
          >
            {/* Relevance Badge */}
            {job.relevanceScore > 20 && (
              <div className="absolute -top-2 -right-2 z-10">
                <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                  Best Match
                </span>
              </div>
            )}

            <div className="p-5">
              {/* Header - Updated to use jobProfession */}
              <div className="flex justify-between items-start mb-3">
                <span className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
                  {job.jobProfession || 'Jewelry'}
                </span>
                <button
                  onClick={(e) => toggleSaveJob(job._id, e)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  {savedJobs.includes(job._id) ? (
                    <FaHeart className="text-red-500 text-lg" />
                  ) : (
                    <FaRegHeart className="text-lg" />
                  )}
                </button>
              </div>

              {/* Title & Company */}
              <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition line-clamp-1">
                {job.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                <VscOrganization className="text-blue-500" />
                <span className="truncate">{job.companyName}</span>
              </p>

              {/* Location & Type */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-orange-500" />
                  <span className="truncate max-w-[100px]">{job.jobLocation}</span>
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-1">
                  <FaBriefcase className="text-blue-500" />
                  <span>{job.empType}</span>
                </span>
              </div>

              {/* Specializations */}
              {job.jewelrySpecialization && job.jewelrySpecialization.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {job.jewelrySpecialization.slice(0, 2).map((spec, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                      {spec}
                    </span>
                  ))}
                  {job.jewelrySpecialization.length > 2 && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      +{job.jewelrySpecialization.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Footer - Updated to use new formatSalary */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <HiOutlineCurrencyRupee className="text-green-500" />
                  <span className="text-sm font-semibold text-gray-800">
                    {formatSalary(job.salary)}
                  </span>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FaRegClock />
                  {getDaysAgo(job.createdAt)}
                </span>
              </div>

              {/* Match Score (Progress Bar) */}
              {job.relevanceScore > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Match Score</span>
                    <span className="text-blue-600 font-semibold">
                      {Math.min(100, Math.round(job.relevanceScore * 2))}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${Math.min(100, job.relevanceScore * 2)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {showViewAll && jobs.length > limit && (
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/candidate/jobs")}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold inline-flex items-center gap-2"
          >
            View All Jobs
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}