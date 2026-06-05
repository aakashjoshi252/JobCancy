// SavedJobs.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  VscArrowLeft,
  VscHeart,
  VscTrash,
  VscEye,
  VscBriefcase,
  VscLocation,
  VscCalendar,
  VscHistory ,
  VscOrganization,
  VscFilter,
  VscClearAll,
  VscWarning,
  VscCheck,
  VscRefresh,
  VscShare,
  VscCopy,
  VscBookmark
} from "react-icons/vsc";
import { HiOutlineCurrencyRupee, HiOutlineLocationMarker } from "react-icons/hi";
import { BiTimeFive } from "react-icons/bi";
import { toast } from "react-hot-toast";

// API service (adjust based on your actual API)
import { jobsApi } from "../../api/api";

export default function SavedJobs() {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, applied, expired
  const [sortBy, setSortBy] = useState("date"); // date, company, title
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid, list

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const normalizeSavedJobs = (records = []) =>
    records
      .map((record) => {
        const job = record.job || record.jobId || record;
        if (!job?._id) return null;

        return {
          ...job,
          _savedJobId: record._id,
          savedAt: record.createdAt || job.createdAt,
          notes: record.notes,
          priority: record.priority,
          companyName: job.companyName || job.companyId?.companyName || job.company?.companyName,
        };
      })
      .filter(Boolean);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsApi.get("/saved-jobs");
      const records = response.data?.data || response.data || [];
      setSavedJobs(normalizeSavedJobs(Array.isArray(records) ? records : []));
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      toast.error("Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveJob = async (savedJobId) => {
    try {
      await jobsApi.delete(`/saved-jobs/${savedJobId}`);
      setSavedJobs(savedJobs.filter(job => job._savedJobId !== savedJobId));
      toast.success("Job removed from saved list");
    } catch (error) {
      console.error("Error removing saved job:", error);
      toast.error("Failed to remove job");
    }
  };

  const handleRemoveSelected = async () => {
    try {
      await Promise.all(
        selectedJobs.map(savedJobId => jobsApi.delete(`/saved-jobs/${savedJobId}`))
      );
      setSavedJobs(savedJobs.filter(job => !selectedJobs.includes(job._savedJobId)));
      setSelectedJobs([]);
      toast.success(`${selectedJobs.length} jobs removed`);
    } catch (error) {
      console.error("Error removing selected jobs:", error);
      toast.error("Failed to remove selected jobs");
    }
  };

  const handleApplyNow = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleShareJob = async (job) => {
    const jobUrl = `${window.location.origin}/jobs/${job._id}`;
    try {
      await navigator.clipboard.writeText(jobUrl);
      toast.success("Job link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const toggleSelectJob = (jobId) => {
    setSelectedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map(job => job._savedJobId));
    }
  };

  const clearAllFilters = () => {
    setFilter("all");
    setSortBy("date");
    setSearchTerm("");
  };

  // Filter and sort jobs
  const filteredJobs = savedJobs
    .filter(job => {
      if (filter === "applied") return job.applied;
      if (filter === "expired") return new Date(job.deadline) < new Date();
      return true;
    })
    .filter(job =>
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobLocation?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "company") {
        return a.companyName?.localeCompare(b.companyName);
      }
      if (sortBy === "title") {
        return a.title?.localeCompare(b.title);
      }
      return 0;
    });

  const getDaysAgo = (date) => {
    if (!date) return 0;
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatSalary = (salary) => {
    if (!salary) return "Not specified";
    if (typeof salary === 'object') {
      if (salary.min && salary.max) {
        return `₹${salary.min.toLocaleString()} - ₹${salary.max.toLocaleString()}`;
      }
      if (salary.min) return `₹${salary.min.toLocaleString()}+`;
      if (salary.max) return `Up to ₹${salary.max.toLocaleString()}`;
    }
    if (typeof salary === 'number') {
      return `₹${salary.toLocaleString()}`;
    }
    return "Not specified";
  };

  if (loading) {
    return <SavedJobsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <VscArrowLeft className="text-xl" />
            Back
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <VscHeart  className="text-3xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Saved Jobs</h1>
          </div>
          <p className="text-xl text-red-100 max-w-3xl">
            Manage and track jobs you've saved for future application
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{savedJobs.length}</div>
              <div className="text-xs text-gray-500">Total Saved</div>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {savedJobs.filter(j => j.applied).length}
              </div>
              <div className="text-xs text-gray-500">Applied</div>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {savedJobs.filter(j => new Date(j.deadline) < new Date()).length}
              </div>
              <div className="text-xs text-gray-500">Expired</div>
            </div>
          </div>
          
          {selectedJobs.length > 0 && (
            <button
              onClick={handleRemoveSelected}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <VscTrash />
              Remove Selected ({selectedJobs.length})
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search saved jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Jobs</option>
                <option value="applied">Applied</option>
                <option value="expired">Expired</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="date">Sort by Date</option>
                <option value="company">Sort by Company</option>
                <option value="title">Sort by Title</option>
              </select>
              
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                title="Clear all filters"
              >
                <VscClearAll />
                Clear
              </button>
              
              <button
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {viewMode === "grid" ? "List View" : "Grid View"}
              </button>
            </div>
          </div>
        </div>

        {/* Select All Checkbox */}
        {filteredJobs.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="selectAll"
              checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
            />
            <label htmlFor="selectAll" className="text-sm text-gray-600">
              Select All ({filteredJobs.length})
            </label>
          </div>
        )}

        {/* Jobs Grid/List */}
        {filteredJobs.length === 0 ? (
          <EmptyState onBrowseJobs={() => navigate("/jobs")} />
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredJobs.map((job) => (
              viewMode === "grid" ? (
                <SavedJobCard
                  key={job._id}
                  job={job}
                  selected={selectedJobs.includes(job._savedJobId)}
                  onSelect={() => toggleSelectJob(job._savedJobId)}
                  onRemove={() => handleRemoveJob(job._savedJobId)}
                  onView={() => handleViewJob(job._id)}
                  onApply={() => handleApplyNow(job._id)}
                  onShare={() => handleShareJob(job)}
                  formatSalary={formatSalary}
                  getDaysAgo={getDaysAgo}
                />
              ) : (
                <SavedJobListItem
                  key={job._id}
                  job={job}
                  selected={selectedJobs.includes(job._savedJobId)}
                  onSelect={() => toggleSelectJob(job._savedJobId)}
                  onRemove={() => handleRemoveJob(job._savedJobId)}
                  onView={() => handleViewJob(job._id)}
                  onApply={() => handleApplyNow(job._id)}
                  onShare={() => handleShareJob(job)}
                  formatSalary={formatSalary}
                  getDaysAgo={getDaysAgo}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Saved Job Card Component (Grid View)
function SavedJobCard({ job, selected, onSelect, onRemove, onView, onApply, onShare, formatSalary, getDaysAgo }) {
  const isExpired = new Date(job.deadline) < new Date();

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all border ${selected ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'}`}>
      <div className="p-5">
        {/* Checkbox and Heart */}
        <div className="flex justify-between items-start mb-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Remove from saved"
          >
            <VscHeart  className="text-xl text-red-500" />
          </button>
        </div>

        {/* Job Title */}
        <h3 
          onClick={onView}
          className="text-xl font-semibold text-gray-800 mb-2 hover:text-red-600 cursor-pointer line-clamp-2"
        >
          {job.title}
        </h3>

        {/* Company and Location */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <VscOrganization className="text-lg flex-shrink-0" />
            <span className="truncate">{job.companyName || "Company Name"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <HiOutlineLocationMarker className="text-lg flex-shrink-0" />
            <span className="truncate">{job.jobLocation || "Location not specified"}</span>
          </div>
        </div>

        {/* Salary and Type */}
        <div className="flex flex-wrap gap-2 mb-4">
          {job.salary && (
            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium flex items-center gap-1">
              <HiOutlineCurrencyRupee className="text-sm" />
              {formatSalary(job.salary)}
            </span>
          )}
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
            {job.empType || "Full-time"}
          </span>
          <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
            {job.experience || "Mid-Level"}
          </span>
        </div>

        {/* Posted Date and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <BiTimeFive />
            <span>Saved {getDaysAgo(job.savedAt || job.createdAt)} days ago</span>
          </div>
          
          {isExpired ? (
            <span className="text-xs text-red-500 font-medium">Expired</span>
          ) : job.applied ? (
            <span className="text-xs text-green-500 font-medium flex items-center gap-1">
              <VscCheck />
              Applied
            </span>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Share job"
              >
                <VscShare className="text-lg" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApply();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                Apply Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Saved Job List Item Component (List View)
function SavedJobListItem({ job, selected, onSelect, onRemove, onView, onApply, onShare, formatSalary, getDaysAgo }) {
  const isExpired = new Date(job.deadline) < new Date();

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all border ${selected ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} p-4`}>
      <div className="flex flex-wrap items-start gap-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="mt-1 w-4 h-4 text-red-600 rounded focus:ring-red-500"
        />
        
        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <h3 
              onClick={onView}
              className="text-lg font-semibold text-gray-800 hover:text-red-600 cursor-pointer"
            >
              {job.title}
            </h3>
            <div className="flex items-center gap-2">
              {isExpired && (
                <span className="text-xs text-red-500 font-medium">Expired</span>
              )}
              {job.applied && !isExpired && (
                <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                  <VscCheck />
                  Applied
                </span>
              )}
              <button
                onClick={onRemove}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Remove from saved"
              >
                <VscTrash className="text-lg" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <VscOrganization className="text-lg" />
              <span>{job.companyName || "Company Name"}</span>
            </div>
            <div className="flex items-center gap-1">
              <HiOutlineLocationMarker className="text-lg" />
              <span>{job.jobLocation || "Location not specified"}</span>
            </div>
            {job.salary && (
              <div className="flex items-center gap-1">
                <HiOutlineCurrencyRupee className="text-lg" />
                <span>{formatSalary(job.salary)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <BiTimeFive />
              <span>Saved {getDaysAgo(job.savedAt || job.createdAt)} days ago</span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        {!isExpired && !job.applied && (
          <div className="flex gap-2">
            <button
              onClick={onShare}
              className="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm flex items-center gap-1"
            >
              <VscShare />
              Share
            </button>
            <button
              onClick={onApply}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg text-sm font-medium transition-colors"
            >
              Apply Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ onBrowseJobs }) {
  return (
    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <VscHeart  className="text-4xl text-red-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Saved Jobs Yet</h3>
      <p className="text-gray-600 mb-6">Start saving jobs you're interested in to apply later</p>
      <button
        onClick={onBrowseJobs}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
      >
        <VscBriefcase />
        Browse Jobs
      </button>
    </div>
  );
}

// Loading Skeleton
function SavedJobsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-pink-600 h-64"></div>
      <div className="max-w-7xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

