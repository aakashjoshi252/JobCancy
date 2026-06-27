import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/api';
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import UserAvatar from '../../components/ui/UserAvatar';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminApi.get('/stats', { withCredentials: true });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">JewelCancy Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your platform from one place</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users Card */}
        <Link
          to="/admin/users"
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Users</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {stats?.users?.total || 0}
          </h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Candidates: {stats?.users?.candidates || 0}</p>
            <p>Recruiters: {stats?.users?.recruiters || 0}</p>
            <p>Admins: {stats?.users?.admins || 0}</p>
          </div>
        </Link>

        {/* Companies Card */}
        <Link
          to="/admin/companies"
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Companies</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {stats?.companies?.total || 0}
          </h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Verified: {stats?.companies?.verified || 0}
            </p>
            <p className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-yellow-600" />
              Pending: {stats?.companies?.unverified || 0}
            </p>
          </div>
        </Link>

        {/* Jobs Card */}
        <Link
          to="/admin/jobs"
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Jobs</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {stats?.jobs?.totalJobs || 0}
          </h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Active: {stats?.jobs?.activeJobs || 0}
            </p>
            <p className="flex items-center gap-1">
              <XCircle className="w-4 h-4 text-red-600" />
              Closed: {stats?.jobs?.closedJobs || 0}
            </p>
          </div>
        </Link>

        {/* Applications Card */}
        <Link
          to="/admin/applications"
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Applications</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {stats?.applications?.total || 0}
          </h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Pending: {stats?.applications?.pending || 0}</p>
            <p>Accepted: {stats?.applications?.accepted || 0}</p>
            <p>Rejected: {stats?.applications?.rejected || 0}</p>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
            <Link
              to="/admin/users"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentActivity?.users?.map((user) => (
              <div
                key={user._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar user={user} className="h-10 w-10 text-sm" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{user.username}</p>
                    <p className="truncate text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin'
                      ? 'bg-red-100 text-red-700'
                      : user.role === 'recruiter'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Companies */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Companies</h2>
            <Link
              to="/admin/companies"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentActivity?.companies?.map((company) => (
              <div
                key={company._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{company.companyName}</p>
                  <p className="text-sm text-gray-600">{company.contactEmail}</p>
                </div>
                {company.isVerified ? (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Verified
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link to="/admin/reports" className="rounded-lg bg-gray-900 p-5 text-white shadow-md transition hover:bg-gray-800">
          <BarChart3 className="mb-3 h-6 w-6" />
          <p className="font-semibold">Generate Reports</p>
          <p className="mt-1 text-sm text-gray-300">PDF, CSV, Excel, and saved snapshots.</p>
        </Link>
        <Link to="/admin/applications" className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300">
          <FileText className="mb-3 h-6 w-6 text-blue-600" />
          <p className="font-semibold text-gray-900">Inspect Applications</p>
          <p className="mt-1 text-sm text-gray-500">Track candidate pipeline status platform-wide.</p>
        </Link>
        <Link to="/admin/professions" className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300">
          <Briefcase className="mb-3 h-6 w-6 text-blue-600" />
          <p className="font-semibold text-gray-900">Profession Coverage</p>
          <p className="mt-1 text-sm text-gray-500">Review active job taxonomy counts.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
