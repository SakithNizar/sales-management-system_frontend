import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { 
  Users, 
  Package, 
  TrendingUp, 
  Factory, 
  AlertTriangle, 
  ShoppingCart, 
  DollarSign,
  RefreshCw,
  Loader,
  Calendar,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { apiRequest } from '../api/api';
import { formatCurrency } from '../utils/formatCurrency';

interface DashboardStats {
  totalUsers: number;
  activeItems: number;
  yearlyExpenses: number;
  totalProductionBatches: number;
  totalCustomers: number;
  totalSalesThisYear: number;
  totalStockValue: number;
}

interface MonthlySalesData {
  labels: string[];
  values: number[];
}

interface RecentActivity {
  _id: string;
  type: 'user' | 'sale' | 'batch' | 'customer';
  description: string;
  user: string;
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, salesData, activitiesData] = await Promise.all([
        apiRequest('/admin-dashboard/stats'),
        apiRequest('/admin-dashboard/monthly-sales'),
        apiRequest('/admin-dashboard/recent-activities'),
      ]);
      
      setStats(statsData.data || statsData);
      setMonthlySales(salesData.data || salesData);
      setRecentActivities(activitiesData.data || activitiesData || []);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Find max sales value for chart scaling
  const maxSalesValue = monthlySales ? Math.max(...monthlySales.values, 0) : 0;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users size={16} className="text-blue-600" />;
      case 'sale':
        return <ShoppingCart size={16} className="text-green-600" />;
      case 'batch':
        return <Factory size={16} className="text-purple-600" />;
      case 'customer':
        return <Users size={16} className="text-orange-600" />;
      default:
        return <Package size={16} className="text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-50';
      case 'sale':
        return 'bg-green-50';
      case 'batch':
        return 'bg-purple-50';
      case 'customer':
        return 'bg-orange-50';
      default:
        return 'bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getBarHeight = (value: number) => {
    if (maxSalesValue === 0) return 0;
    return (value / maxSalesValue) * 100;
  };

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Users size={32} />
            <div>
              <h1 className="text-2xl font-bold">Welcome, {user?.fullName || user?.username}</h1>
              <p className="text-blue-100 text-sm">ID: {user?._id} | Role: {user?.role?.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg transition flex items-center gap-1 text-sm"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <div className={`px-4 py-2 rounded-full font-semibold ${user?.role === 'admin' ? 'bg-green-500' : 'bg-orange-500'}`}>
              {user?.role?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users size={32} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Active Items</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.activeItems}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Package size={32} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalCustomers}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Users size={32} className="text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Production Batches</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalProductionBatches}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Factory size={32} className="text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Second Row of Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Yearly Expenses</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{formatCurrency(stats.yearlyExpenses)}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <TrendingUp size={28} className="text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Sales (Year)</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{formatCurrency(stats.totalSalesThisYear)}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign size={28} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Stock Value</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{formatCurrency(stats.totalStockValue)}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package size={28} className="text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Monthly Sales Chart (CSS-based bar chart) */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Monthly Sales Trend</h3>
          <BarChart3 size={20} className="text-gray-400" />
        </div>
        {monthlySales && monthlySales.values.length > 0 ? (
          <div className="h-80">
            <div className="flex h-full gap-2 items-end">
              {monthlySales.labels.map((label, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full group">
                    <div 
                      className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 rounded-t-lg cursor-pointer"
                      style={{ height: `${getBarHeight(monthlySales.values[index])}%`, minHeight: '4px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {formatCurrency(monthlySales.values[index])}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 rotate-45 origin-left whitespace-nowrap">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No sales data available
          </div>
        )}
      </div>

      {/* Quick Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Average Order Value</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(stats.totalSalesThisYear / Math.max(1, stats.totalCustomers))}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Revenue per Customer</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(stats.totalSalesThisYear / Math.max(1, stats.totalCustomers))}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Expense to Income Ratio</span>
                <span className="font-semibold text-gray-900">
                  {stats.yearlyExpenses > 0 && stats.totalSalesThisYear > 0
                    ? `${((stats.yearlyExpenses / stats.totalSalesThisYear) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Net Profit Margin</span>
                <span className="font-semibold text-green-600">
                  {stats.totalSalesThisYear > 0
                    ? `${(((stats.totalSalesThisYear - stats.yearlyExpenses) / stats.totalSalesThisYear) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Items per Customer</span>
                <span className="font-semibold text-gray-900">
                  {stats.totalCustomers > 0
                    ? (stats.activeItems / stats.totalCustomers).toFixed(1)
                    : '0'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recent Activities</h3>
              <button 
                onClick={loadDashboardData}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                Refresh
              </button>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity._id} className={`${getActivityColor(activity.type)} rounded-lg p-3 transition hover:shadow`}>
                    <div className="flex items-start gap-3">
                      <div className="bg-white rounded-full p-1.5 shadow-sm">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">By: {activity.user}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{formatDate(activity.createdAt)}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm">No recent activities</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/users?createUser=true')}
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition group"
          >
            <Users size={24} className="text-blue-600 mb-2 group-hover:scale-110 transition" />
            <span className="text-sm font-medium text-gray-700">Create User</span>
          </button>
          <button 
            onClick={() => navigate('/users?assignRoutes=true')}
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition group"
          >
            <Package size={24} className="text-green-600 mb-2 group-hover:scale-110 transition" />
            <span className="text-sm font-medium text-gray-700">Assign Routes</span>
          </button>
          <button 
            onClick={() => navigate('/items?createItem=true')}
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition group"
          >
            <Package size={24} className="text-orange-600 mb-2 group-hover:scale-110 transition" />
            <span className="text-sm font-medium text-gray-700">Add Item</span>
          </button>
          <button 
            onClick={() => navigate('/expenses')}
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition group"
          >
            <TrendingUp size={24} className="text-purple-600 mb-2 group-hover:scale-110 transition" />
            <span className="text-sm font-medium text-gray-700">Add Expense</span>
          </button>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-full p-2">
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Admin Tips</h4>
            <p className="text-sm text-gray-600">
              • Regularly review low stock alerts to maintain inventory levels.<br />
              • Monitor sales trends to adjust production accordingly.<br />
              • Keep track of user activities for security purposes.<br />
              • Use the monthly report feature for financial analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}