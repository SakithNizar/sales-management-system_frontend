import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import useSalesStore from '../stores/useSalesStore';
import useCustomerStore from '../stores/useCustomerStore';
import { Users, TrendingUp, DollarSign, Map, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export default function SalesmanDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { sales } = useSalesStore();
  const { customers } = useCustomerStore();

  // Calculate metrics
  const totalSales = sales.reduce((sum: number, s: any) => sum + (s.total || 0), 0);
  const totalCustomers = customers.length;
  const averageOrderValue = sales.length > 0 ? totalSales / sales.length : 0;
  const thisMonthSales = sales.filter((s: any) => {
    const saleDate = new Date(s.date);
    const now = new Date();
    return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
  }).reduce((sum: number, s: any) => sum + (s.total || 0), 0);

  const recentCustomers = [
    { name: 'Kamal Perera', shop: 'Kandy Grocery', contact: '0771234567', route: 'Main Street Route' },
    { name: 'Nimal Dissanayake', shop: 'Kandy Supermarket', contact: '0771234568', route: 'Kandy Road' },
    { name: 'Jayantha Silva', shop: 'Local Bakery', contact: '0771234569', route: 'Main Street Route' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Users size={32} />
            <div>
              <h1 className="text-2xl font-bold">Salesman Dashboard</h1>
              <p className="text-blue-100 text-sm">Welcome back, {user?.name}! Here's your sales overview.</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-full font-semibold bg-orange-500">
            {user?.role?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Sales */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Sales</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(totalSales)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp size={32} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* This Month Sales */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">This Month</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(thisMonthSales)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign size={32} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">My Customers</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalCustomers}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users size={32} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Avg Order Value</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(averageOrderValue)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp size={32} className="text-orange-600" />
            </div>
          </div>
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
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <Plus size={24} className="text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Create New Customer</span>
            </button>
            <button 
              onClick={() => navigate('/sales-entry')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition"
            >
              <TrendingUp size={24} className="text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">New Sale</span>
            </button>
            <button 
              onClick={() => navigate('/customers')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition"
            >
              <Users size={24} className="text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">My Customers</span>
            </button>
            <button 
              onClick={() => navigate('/my-routes')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition"
            >
              <Map size={24} className="text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">My Routes</span>
            </button>
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Customers</h3>
          
          <div className="space-y-4">
            {recentCustomers.map((customer, idx) => (
              <div key={idx} className="border-b border-gray-100 pb-4 last:border-b-0">
                <p className="font-semibold text-gray-800 text-sm">{customer.name}</p>
                <p className="text-xs text-gray-500">{customer.shop}</p>
                <p className="text-xs text-gray-600 mt-1">{customer.contact}</p>
                <p className="text-xs text-blue-600 mt-1">{customer.route}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
