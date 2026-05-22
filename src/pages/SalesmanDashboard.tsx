import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { Users, TrendingUp, DollarSign, Map, Plus, Loader, Clock, CreditCard } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { apiRequest } from '../api/api';

interface DashboardStats {
  myCustomersCount: number;
  thisMonthSales: number;
  collectedPayments: number;
  outstandingBalance: number;
}

interface RecentCustomer {
  _id: string;
  customerName: string;
  shopName: string;
  phoneNumber: string;
  route?: {
    name: string;
    city: string;
  };
  createdAt: string;
}

export default function SalesmanDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    myCustomersCount: 0,
    thisMonthSales: 0,
    collectedPayments: 0,
    outstandingBalance: 0
  });
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load dashboard statistics
      const statsResponse = await apiRequest('/customers/salesman/stats');
      setStats(statsResponse.data || statsResponse);
      
      // Load recent customers (last 5)
      const customersResponse = await apiRequest('/customers');
      const recent = customersResponse.slice(0, 5);
      setRecentCustomers(recent);
      
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
              <h1 className="text-2xl font-bold">Salesman Dashboard</h1>
              <p className="text-blue-100 text-sm">Welcome back, {user?.fullName || user?.username}! Here's your sales overview.</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-full font-semibold bg-orange-500 text-sm">
            {user?.role?.toUpperCase() || 'SALESMAN'}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="text-sm">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* My Customers */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">My Customers</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.myCustomersCount}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users size={32} className="text-blue-600" />
            </div>
          </div>
          <button 
            onClick={() => navigate('/customers')}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            View All Customers →
          </button>
        </div>

        {/* This Month Sales */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">This Month Sales</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(stats.thisMonthSales)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp size={32} className="text-green-600" />
            </div>
          </div>
          <button 
            onClick={() => navigate('/sales-entry')}
            className="mt-4 text-sm text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
          >
            New Sale →
          </button>
        </div>

        {/* Collected Payments */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Collected Payments</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(stats.collectedPayments)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <CreditCard size={32} className="text-purple-600" />
            </div>
          </div>
          <button 
            onClick={() => navigate('/payments')}
            className="mt-4 text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
          >
            Record Payment →
          </button>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Outstanding Balance</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{formatCurrency(stats.outstandingBalance)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock size={32} className="text-orange-600" />
            </div>
          </div>
          <button 
            onClick={() => navigate('/payments')}
            className="mt-4 text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1"
          >
            View Collections →
          </button>
        </div>
      </div>

      {/* Quick Actions & Recent Customers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/customers?createCustomer=true')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition group"
            >
              <Plus size={24} className="text-blue-600 mb-2 group-hover:scale-110 transition" />
              <span className="text-sm font-medium text-gray-700">Create New Customer</span>
            </button>
            <button 
              onClick={() => navigate('/sales-entry')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition group"
            >
              <TrendingUp size={24} className="text-green-600 mb-2 group-hover:scale-110 transition" />
              <span className="text-sm font-medium text-gray-700">New Sale</span>
            </button>
            <button 
              onClick={() => navigate('/customers')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition group"
            >
              <Users size={24} className="text-purple-600 mb-2 group-hover:scale-110 transition" />
              <span className="text-sm font-medium text-gray-700">My Customers</span>
            </button>
            <button 
              onClick={() => navigate('/my-routes')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition group"
            >
              <Map size={24} className="text-orange-600 mb-2 group-hover:scale-110 transition" />
              <span className="text-sm font-medium text-gray-700">My Routes</span>
            </button>
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Customers</h3>
            <button 
              onClick={() => navigate('/customers')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </button>
          </div>
          
          {recentCustomers.length > 0 ? (
            <div className="space-y-4">
              {recentCustomers.map((customer) => (
                <div key={customer._id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <p className="font-semibold text-gray-800 text-sm">{customer.customerName}</p>
                  <p className="text-xs text-gray-500">{customer.shopName}</p>
                  <p className="text-xs text-gray-600 mt-1">{customer.phoneNumber}</p>
                  {customer.route && (
                    <p className="text-xs text-blue-600 mt-1">
                      {customer.route.name} - {customer.route.city}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm">No customers yet</p>
              <button 
                onClick={() => navigate('/customers?createCustomer=true')}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                + Create Customer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info - Collection Progress */}
      {stats.outstandingBalance > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Collection Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Collected vs Outstanding</p>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                      Collected: {formatCurrency(stats.collectedPayments)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
                      Outstanding: {formatCurrency(stats.outstandingBalance)}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div 
                    style={{ width: `${(stats.collectedPayments / (stats.collectedPayments + stats.outstandingBalance)) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  ></div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">💡 Tip</p>
              <p className="text-xs text-gray-600">
                Follow up with customers who have outstanding balances to improve collection rate.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}