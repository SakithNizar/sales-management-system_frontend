import useAuthStore from '../stores/useAuthStore';
import { MapPin, Users, Calendar, ArrowRight } from 'lucide-react';

export default function MyRoutes() {
  const { user } = useAuthStore();

  // Mock data - routes assigned to the salesman
  const assignedRoutes = [
    {
      id: 'ROUTE-001',
      name: 'Main Street Route',
      area: 'Central Kandy',
      customers: 12,
      status: 'Active',
      assignedDate: '2025-01-15',
      description: 'Main Street and surrounding areas',
      stops: ['Kandy Grocery', 'Kandy Supermarket', 'Local Bakery']
    },
    {
      id: 'ROUTE-002',
      name: 'Kandy Road',
      area: 'Kandy Road Area',
      customers: 8,
      status: 'Active',
      assignedDate: '2025-01-15',
      description: 'Kandy Road and nearby streets',
      stops: ['Kandy Supermarket', 'Kamal Grocery', 'Nimal Store']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Sales Routes</h1>
        <p className="text-gray-600">Your assigned routes and customer information</p>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignedRoutes.map((route) => (
          <div key={route.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            {/* Route Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold">{route.name}</h2>
                  <p className="text-blue-100 text-sm mt-1">{route.description}</p>
                </div>
                <span className="bg-blue-500 px-3 py-1 rounded-full text-xs font-semibold">
                  {route.status}
                </span>
              </div>
            </div>

            {/* Route Details */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Area */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={18} className="text-blue-600" />
                    <p className="text-sm font-semibold text-gray-700">Area</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{route.area}</p>
                </div>

                {/* Customers */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={18} className="text-green-600" />
                    <p className="text-sm font-semibold text-gray-700">Customers</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{route.customers}</p>
                </div>

                {/* Route ID */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={18} className="text-purple-600" />
                    <p className="text-sm font-semibold text-gray-700">Route ID</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{route.id}</p>
                </div>

                {/* Assigned Date */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={18} className="text-orange-600" />
                    <p className="text-sm font-semibold text-gray-700">Assigned</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{new Date(route.assignedDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Customer Stops */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Customer Stops ({route.stops.length})</h4>
                <div className="space-y-2">
                  {route.stops.map((stop, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700 text-sm">
                      <ArrowRight size={16} className="text-blue-600" />
                      <span>{stop}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition">
                View Route Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {assignedRoutes.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Routes Assigned</h3>
          <p className="text-gray-600">You don't have any routes assigned yet. Contact your admin to assign routes.</p>
        </div>
      )}

      {/* Summary */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Route Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Routes</p>
            <p className="text-3xl font-bold text-blue-600">{assignedRoutes.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-green-600">
              {assignedRoutes.reduce((sum, r) => sum + r.customers, 0)}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Stops</p>
            <p className="text-3xl font-bold text-orange-600">
              {assignedRoutes.reduce((sum, r) => sum + r.stops.length, 0)}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Active Routes</p>
            <p className="text-3xl font-bold text-purple-600">
              {assignedRoutes.filter(r => r.status === 'Active').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
