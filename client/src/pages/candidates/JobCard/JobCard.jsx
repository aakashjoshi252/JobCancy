import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getCompanyDisplayName } from "../../../utils/jobVisibility";

// Utility function to safely format salary
const formatSalary = (salary) => {
  if (!salary) return "Not specified";
  
  try {
    // Handle monthly structure
    if (salary.monthly) {
      const min = salary.monthly.min ? `₹${salary.monthly.min.toLocaleString()}` : '';
      const max = salary.monthly.max ? `₹${salary.monthly.max.toLocaleString()}` : '';
      if (min && max) return `${min} - ${max}`;
      if (min) return `${min}+`;
      if (max) return `Up to ${max}`;
    }
    
    // Handle direct min/max
    if (salary.min !== undefined || salary.max !== undefined) {
      const min = salary.min ? `₹${salary.min.toLocaleString()}` : '';
      const max = salary.max ? `₹${salary.max.toLocaleString()}` : '';
      if (min && max) return `${min} - ${max}`;
      if (min) return `${min}+`;
      if (max) return `Up to ${max}`;
    }
    
    // Handle hourly/contract structures
    const salaryTypes = ['hourly', 'perPiece', 'contract', 'annual'];
    for (const type of salaryTypes) {
      if (salary[type]) {
        if (typeof salary[type] === 'object') {
          const min = salary[type].min ? `₹${salary[type].min.toLocaleString()}` : '';
          const max = salary[type].max ? `₹${salary[type].max.toLocaleString()}` : '';
          if (min && max) return `${type}: ${min} - ${max}`;
          if (min) return `${type}: ${min}+`;
          if (max) return `${type}: Up to ${max}`;
        } else if (typeof salary[type] === 'number') {
          return `${type}: ₹${salary[type].toLocaleString()}`;
        }
      }
    }
    
    // Handle number salary
    if (typeof salary === 'number') {
      return `₹${salary.toLocaleString()}`;
    }
    
    return "Not specified";
  } catch (error) {
    console.error("Error formatting salary:", error);
    return "Not specified";
  }
};

// Utility function to safely format date
const formatDate = (date) => {
  if (!date) return "Recently";
  
  try {
    const postedDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - postedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch (error) {
    return "Recently";
  }
};

export default function JobList({ jobs }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = Boolean(user);

  if (!jobs || !Array.isArray(jobs)) {
    return <div className="text-gray-500 text-center py-8">No jobs available</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-5">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800">Featured Jobs</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {jobs.map((job, index) => (
          <div 
            key={job._id || job.id || index} 
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/jobs/${job._id || job.id}`)}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {job?.title || "Position Title"}
            </h3>
            
            <div className="mb-4">
              <p className="font-medium text-gray-700">
                {getCompanyDisplayName(job, isAuthenticated)}
              </p>
              <p className="text-gray-500 text-sm">
                {job?.location || job?.jobLocation || "Location not specified"}
              </p>
            </div>
            
            <div className="border-t border-b border-gray-100 py-4 mb-4 space-y-1">
              <p className="text-gray-600">
                {job?.type || job?.empType || job?.employmentType || "Full-time"}
              </p>
              <p className="text-gray-600">
                {job?.experience || job?.experienceLevel || "Experience not specified"}
              </p>
              <p className="text-gray-600 font-medium">
                {formatSalary(job?.salary)}
              </p>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">
                {formatDate(job?.postedDate || job?.createdAt)}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthenticated) {
                    navigate("/login", { state: { from: `/jobs/${job._id || job.id}` } });
                    return;
                  }
                  navigate(`/jobs/${job._id || job.id}`);
                }} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {isAuthenticated ? "View / Apply" : "Login to Apply"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
