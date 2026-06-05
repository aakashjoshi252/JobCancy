import { useState, useEffect } from 'react';
import {adminApi} from "../../api/api"
import toast from 'react-hot-toast';
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  CircleCheck,
  CirclePause,
  CircleX,
  RotateCcw,
} from 'lucide-react';
import {
  getDisplayJobStatus,
  getJobExpiryDate,
} from '../../utils/jobVisibility';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchJobs();
  }, [pagination.page, statusFilter, approvalFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter && { status: statusFilter }),
        ...(approvalFilter && { approvalStatus: approvalFilter }),
        ...(search && { search }),
      };

      const response = await adminApi.get(
        `/jobs`,
        { params, withCredentials: true }
      );

      setJobs(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    fetchJobs();
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      await adminApi.delete(
        `/jobs/${jobId}`,
        { withCredentials: true }
      );
      toast.success('Job deleted');
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting job');
    }
  };

  const handleModeration = async (jobId, patch) => {
    try {
      await adminApi.patch(`/jobs/${jobId}/moderation`, patch);
      toast.success('Job moderation updated');
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update job');
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    return `Up to ₹${max.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Job Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage all job postings</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
            <option value="closed">Closed</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Reviews</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No jobs found</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {jobs.map((job) => {
                const displayStatus = getDisplayJobStatus(job);
                const expiryDate = getJobExpiryDate(job);

                return (
                <div key={job._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      {/* Job Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 font-medium">
                            {job.companyId?.companyName || 'Company Name'}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            displayStatus === 'active'
                              ? 'bg-green-100 text-green-700'
                              : displayStatus === 'paused'
                                ? 'bg-yellow-100 text-yellow-700'
                                : displayStatus === 'expired'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {displayStatus}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            job.approvalStatus === 'Rejected'
                              ? 'bg-red-100 text-red-700'
                              : job.approvalStatus === 'Pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {job.approvalStatus || 'Approved'}
                        </span>
                      </div>

                      {/* Job Details */}
                      <div className="flex flex-wrap gap-4 mb-3">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{job.jobLocation}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Briefcase className="w-4 h-4 mr-1" />
                          <span className="text-sm">{job.empType}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="text-sm">
                            {formatSalary(job.salary?.monthly?.min, job.salary?.monthly?.max)}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span className="text-sm">
                            Posted {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {expiryDate && (
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              Expires {new Date(expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Requirements */}
                      {job.requirements && job.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.requirements.slice(0, 5).map((req, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                            >
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                              +{job.requirements.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          <Eye className="w-4 h-4 inline mr-1" />
                          {job.applicantsCount || job.applicants?.length || 0} applicants
                        </span>
                        <span>•</span>
                        <span>Created by: {job.recruiterId?.username || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap gap-2 lg:mt-0 lg:ml-6 lg:max-w-64 lg:justify-end">
                      {job.approvalStatus !== 'Approved' && (
                        <button
                          onClick={() => handleModeration(job._id, { approvalStatus: 'Approved', status: 'active' })}
                          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                          title="Approve Job"
                        >
                          <CircleCheck className="w-4 h-4" />
                          Approve
                        </button>
                      )}
                      {job.approvalStatus !== 'Rejected' && (
                        <button
                          onClick={() => handleModeration(job._id, { approvalStatus: 'Rejected', status: 'closed' })}
                          className="flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                          title="Reject Job"
                        >
                          <CircleX className="w-4 h-4" />
                          Reject
                        </button>
                      )}
                      {displayStatus === 'active' ? (
                        <button
                          onClick={() => handleModeration(job._id, { status: 'paused' })}
                          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-yellow-300 hover:text-yellow-700"
                          title="Pause Job"
                        >
                          <CirclePause className="w-4 h-4" />
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => handleModeration(job._id, { status: 'active' })}
                          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-green-300 hover:text-green-700"
                          title="Reopen Job"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reopen
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{jobs.length}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> jobs (Page{' '}
                    <span className="font-medium">{pagination.page}</span> of{' '}
                    <span className="font-medium">{pagination.pages}</span>)
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        setPagination({ ...pagination, page: pagination.page - 1 })
                      }
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        setPagination({ ...pagination, page: pagination.page + 1 })
                      }
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobManagement;
