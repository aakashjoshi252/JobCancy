import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  CheckCircle, 
  BarChart3,
  PieChart,
  Calendar,
  Download,
  AlertCircle,
  Filter
} from 'lucide-react';
import { dashboardApi, applicationApi, jobsApi } from '../../api/api';

const RecruiterAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(30);
  const [selectedJob, setSelectedJob] = useState('all');
  const [jobs, setJobs] = useState([]);
  
  const loggedUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (loggedUser?._id) {
      fetchJobs();
    }
  }, [loggedUser?._id]);

  useEffect(() => {
    if (loggedUser?._id) {
      fetchAnalytics();
    }
  }, [period, selectedJob, loggedUser?._id]);

  const fetchJobs = async () => {
    try {
      const res = await jobsApi.get(`/recruiter/${loggedUser?._id}`);
      const jobsData = res.data?.data || res.data || [];
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let applications = [];
      
      if (selectedJob === 'all') {
        const res = await applicationApi.get(`/recruiter/${loggedUser?._id}`);
        applications = res.data?.data || res.data || [];
      } else {
        const res = await applicationApi.get(`/job/${selectedJob}`);
        applications = res.data?.data || res.data || [];
      }
      
      const analyticsData = calculateAnalytics(applications);
      setAnalytics(analyticsData);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data. Please try again.');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (applications) => {
    if (!applications || applications.length === 0) {
      return {
        totalApplications: 0,
        funnel: [],
        avgTimeToHire: 0,
        applicationTrend: [],
        statusBreakdown: {},
        conversionRates: {}
      };
    }

    const statuses = ['Pending', 'Reviewing', 'Shortlisted', 'Interviewed', 'Selected', 'Rejected', 'Accepted'];
    const funnel = statuses.map(status => ({
      _id: status,
      count: applications.filter(app => app.status === status).length
    }));

    const acceptedApps = applications.filter(app => app.status === 'Selected' || app.status === 'Accepted');
    const avgTimeToHire = acceptedApps.length > 0
      ? Math.round(acceptedApps.reduce((sum, app) => {
          const appliedDate = new Date(app.createdAt);
          const acceptedDate = new Date(app.updatedAt);
          const daysDiff = Math.ceil((acceptedDate - appliedDate) / (1000 * 60 * 60 * 24));
          return sum + daysDiff;
        }, 0) / acceptedApps.length)
      : 0;

    const trendMap = new Map();
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    applications.forEach(app => {
      const appDate = new Date(app.createdAt);
      if (appDate >= last30Days) {
        const dateKey = appDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1);
      }
    });
    
    const applicationTrend = Array.from(trendMap.entries())
      .map(([date, count]) => ({ _id: date, count }))
      .sort((a, b) => new Date(a._id) - new Date(b._id));

    const totalApps = applications.length;
    const conversionRates = {
      toShortlisted: totalApps > 0 
        ? Math.round((funnel.find(f => f._id === 'Shortlisted')?.count || 0) / totalApps * 100)
        : 0,
      toInterviewed: totalApps > 0
        ? Math.round((funnel.find(f => f._id === 'Interviewed')?.count || 0) / totalApps * 100)
        : 0,
      toSelected: totalApps > 0
        ? Math.round((funnel.find(f => f._id === 'Selected')?.count || 0) / totalApps * 100)
        : 0,
      toAccepted: totalApps > 0
        ? Math.round((funnel.find(f => f._id === 'Accepted')?.count || 0) / totalApps * 100)
        : 0
    };

    const statusBreakdown = {};
    applications.forEach(app => {
      statusBreakdown[app.status] = (statusBreakdown[app.status] || 0) + 1;
    });

    return {
      totalApplications: applications.length,
      funnel,
      avgTimeToHire,
      applicationTrend,
      statusBreakdown,
      conversionRates
    };
  };

  const getFunnelCount = (status) => {
    if (!analytics?.funnel) return 0;
    const found = analytics.funnel.find(f => f._id === status);
    return found?.count || 0;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-500',
      'Reviewing': 'bg-blue-500',
      'Shortlisted': 'bg-purple-500',
      'Interviewed': 'bg-indigo-500',
      'Selected': 'bg-green-500',
      'Accepted': 'bg-emerald-500',
      'Rejected': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'Pending': 'New Applications',
      'Reviewing': 'Under Review',
      'Shortlisted': 'Shortlisted',
      'Interviewed': 'Interviewed',
      'Selected': 'Selected',
      'Accepted': 'Accepted',
      'Rejected': 'Rejected'
    };
    return labels[status] || status;
  };

  const exportAnalytics = () => {
    if (!analytics) return;
    
    const data = {
      period: `${period} days`,
      totalApplications: analytics.totalApplications,
      avgTimeToHire: analytics.avgTimeToHire,
      funnel: analytics.funnel,
      conversionRates: analytics.conversionRates,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${period}days_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Loading State - Matching Dashboard Skeleton
  if (loading) {
    return <AnalyticsSkeleton />;
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No Data State
  if (!analytics || analytics.totalApplications === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="text-5xl text-gray-300 mx-auto mb-4">
              <BarChart3 className="w-16 h-16 mx-auto text-gray-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              No applications have been received yet. Analytics will appear once you start receiving applications.
            </p>
            <button
              onClick={() => navigate('/recruiter/company/jobpost')}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium inline-flex items-center gap-2 shadow-sm"
            >
              <span>+</span>
              Create a Job Posting
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Analytics View
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section - Matching Dashboard Header Style */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Recruitment Analytics</h1>
                </div>
                <p className="text-blue-100 text-sm">Track your hiring metrics and performance</p>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="all" className="text-gray-900">All Jobs</option>
                  {jobs.map(job => (
                    <option key={job._id} value={job._id} className="text-gray-900">
                      {job.title}
                    </option>
                  ))}
                </select>
                
                <select
                  value={period}
                  onChange={(e) => setPeriod(parseInt(e.target.value))}
                  className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="7" className="text-gray-900">Last 7 days</option>
                  <option value="30" className="text-gray-900">Last 30 days</option>
                  <option value="90" className="text-gray-900">Last 90 days</option>
                </select>
                
                <button
                  onClick={exportAnalytics}
                  className="px-3 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-sm flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics - Matching StatCard Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Applications"
            value={analytics.totalApplications}
            icon={<Users className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            title="Acceptance Rate"
            value={`${analytics.conversionRates?.toAccepted || 0}%`}
            icon={<Target className="w-5 h-5" />}
            color="green"
          />
          <MetricCard
            title="Avg. Time to Hire"
            value={analytics.avgTimeToHire}
            subtitle="days"
            icon={<Clock className="w-5 h-5" />}
            color="purple"
          />
          <MetricCard
            title="Total Hired"
            value={getFunnelCount('Selected') + getFunnelCount('Accepted')}
            icon={<CheckCircle className="w-5 h-5" />}
            color="orange"
          />
        </div>

        {/* Application Funnel - Matching Dashboard Card Style */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Application Funnel
            </h2>
          </div>
          <div className="space-y-4">
            {['Pending', 'Reviewing', 'Shortlisted', 'Interviewed', 'Selected', 'Accepted'].map((status) => {
              const count = getFunnelCount(status);
              const total = analytics.totalApplications;
              const percentage = total > 0 ? (count / total) * 100 : 0;

              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      {getStatusLabel(status)}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${getStatusColor(status)} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion Rates & Application Trend Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Conversion Rates Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Conversion Rates</h2>
            <div className="space-y-4">
              <ConversionRateItem
                label="Application → Shortlisted"
                value={analytics.conversionRates?.toShortlisted || 0}
                color="purple"
              />
              <ConversionRateItem
                label="Shortlisted → Interviewed"
                value={analytics.conversionRates?.toInterviewed || 0}
                color="indigo"
              />
              <ConversionRateItem
                label="Interviewed → Selected"
                value={analytics.conversionRates?.toSelected || 0}
                color="green"
              />
            </div>
          </div>

          {/* Application Trend Card */}
          {analytics.applicationTrend && analytics.applicationTrend.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Application Trend
              </h2>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {analytics.applicationTrend.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {trend._id}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-blue-600">{trend.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Breakdown - Matching Dashboard Card Style */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Status Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(analytics.statusBreakdown || {}).map(([status, count]) => (
              <div key={status} className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center hover:shadow-md transition border border-gray-100">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${getStatusColor(status)} rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-sm`}>
                  <span className="text-white font-bold text-base sm:text-lg">{count}</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-700">{getStatusLabel(status)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.totalApplications > 0 
                    ? `${Math.round((count / analytics.totalApplications) * 100)}%`
                    : '0%'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component - Matching StatCard from Dashboard
function MetricCard({ title, value, subtitle, icon, color }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-sm`}>
          {icon}
        </div>
      </div>
      <div className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className="text-xs text-gray-600 font-medium">{title}</div>
      {subtitle && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">{subtitle}</span>
        </div>
      )}
    </div>
  );
}

// Conversion Rate Item Component
function ConversionRateItem({ label, value, color }) {
  const colorClasses = {
    purple: "bg-purple-500",
    indigo: "bg-indigo-500",
    green: "bg-green-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs sm:text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs sm:text-sm font-bold text-gray-900">{value}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

// Analytics Skeleton - Matching Dashboard Skeleton
function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32 sm:h-40 animate-pulse"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 -mt-10 sm:-mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 sm:h-5 bg-gray-200 rounded w-12 mb-1"></div>
              <div className="h-3 bg-gray-100 rounded w-16"></div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="mb-3">
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-2 bg-gray-100 rounded w-full"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-3">
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-100 rounded w-full"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded mb-2"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecruiterAnalytics;