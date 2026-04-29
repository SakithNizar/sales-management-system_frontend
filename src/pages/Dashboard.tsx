import { useNavigate } from 'react-router-dom';
import useProductStore from '../stores/useProductStore';
import useInventoryStore from '../stores/useInventoryStore';
import useAuthStore from '../stores/useAuthStore';
import type { InventoryItem } from '../types';
import { Users, Package, TrendingUp, Factory, MoreVertical, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { products } = useProductStore();
  const { items } = useInventoryStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const totalUsers = 24;
  const activeItems = 156;
  const yearlyExpenses = 'LKR 342.8K';
  const productionBatches = 42;
  const lowStock = items.filter((i: InventoryItem) => i.stock <= i.reorderLvl).length;
  const totalItems = products.length;

  const recentUsers = [
    { name: 'Nousan Silva', username: 'nousan_s', role: 'salesman', status: 'active' },
    { name: 'Ashish User', username: 'ashish01', role: 'admin', status: 'active' },
    { name: 'Dilari Kumalo', username: 'dilari_l', role: 'salesman', status: 'inactive' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Users size={32} />
            <div>
              <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
              <p className="text-blue-100 text-sm">ID: {user?.id} | Role: {user?.role?.toUpperCase()}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold ${user?.role === 'admin' ? 'bg-green-500' : 'bg-orange-500'}`}>
            {user?.role?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalUsers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users size={32} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Items Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Items</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{activeItems}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Package size={32} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Yearly Expenses Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Yearly Expenses</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{yearlyExpenses}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp size={32} className="text-orange-600" />
            </div>
          </div>
        </div>

        {/* Production Batches Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Production Batches</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{productionBatches}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Factory size={32} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Users Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Connect Tools
            </a>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/user-management')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <Users size={24} className="text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Create User</span>
            </button>
            <button 
              onClick={() => navigate('/route-management')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition"
            >
              <Package size={24} className="text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Assign Routes</span>
            </button>
            <button 
              onClick={() => navigate('/inventory')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition"
            >
              <Package size={24} className="text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Add Item</span>
            </button>
            <button 
              onClick={() => navigate('/accounts')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition"
            >
              <TrendingUp size={24} className="text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Add Expense</span>
            </button>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Low Stock Alerts</h3>
            <a href="/inventory" className="text-blue-600 hover:text-blue-800 text-xs font-medium">
              View More
            </a>
          </div>
          
          {lowStock > 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-800">{lowStock} Items</p>
                  <p className="text-sm text-red-600">Below reorder level</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm font-medium">✓ All items are adequately stocked</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Recent Users</h2>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentUsers.map((u) => (
                <tr key={u.username} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.username}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      u.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
