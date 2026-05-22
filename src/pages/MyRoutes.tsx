import { useEffect, useState } from 'react';
import useAuthStore from '../stores/useAuthStore';
import { MapPin, Users, Calendar, ArrowRight, User, Mail, Phone, Calendar as CalendarIcon, CheckCircle, Loader, ShoppingBag } from 'lucide-react';
import { apiRequest } from '../api/api';
import { useNavigate } from 'react-router-dom';

interface Route {
  _id: string;
  name: string;
  city: string;
  routeName?: string;
}

interface UserProfile {
  _id: string;
  fullName: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  status: string;
  assignedRoutes: Route[];
  createdAt: string;
}

interface RouteWithDetails extends Route {
  customers?: number;
  status?: string;
  assignedDate?: string;
  description?: string;
}

export default function MyRoutes() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [routes, setRoutes] = useState<RouteWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the dedicated current user profile endpoint
      const userData = await apiRequest('/users/me/profile');
      setProfile(userData);
      
      // Format routes for display
      const formattedRoutes = (userData.assignedRoutes || []).map((route: Route) => ({
        ...route,
        id: route._id,
        name: route.name,
        area: route.city,
        customers: 0,
        status: 'Active',
        assignedDate: new Date().toISOString().split('T')[0],
        description: `${route.name} route covering ${route.city} area`
      }));
      setRoutes(formattedRoutes);
    } catch (error: any) {
      console.error('Error loading user profile:', error);
      setError(error.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const handleViewCustomers = (routeId: string) => {
    navigate(`/customers?route=${routeId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="text-sm">{error}</p>
          <button 
            onClick={loadUserProfile}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          <p className="text-sm">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile & Routes</h1>
        <p className="text-gray-600">View your profile information and assigned sales routes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card - Left Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-6">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-full p-4">
                  <User size={40} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                  <p className="text-blue-100">@{profile.username}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  profile.status === 'active' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-500 text-white'
                }`}>
                  {profile.status === 'active' && <CheckCircle size={12} />}
                  {profile.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Role</p>
                <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">{profile.role}</p>
              </div>

              {profile.email && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Mail size={12} /> Email
                  </p>
                  <p className="text-sm text-gray-900 mt-1">{profile.email}</p>
                </div>
              )}

              {profile.phoneNumber && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Phone size={12} /> Phone Number
                  </p>
                  <p className="text-sm text-gray-900 mt-1">{profile.phoneNumber}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <CalendarIcon size={12} /> Joined
                </p>
                <p className="text-sm text-gray-900 mt-1">{formatDate(profile.createdAt)}</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">User ID</p>
                <p className="text-xs font-mono text-gray-600 mt-1 break-all">{profile._id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Routes Section - Right Column */}
        <div className="lg:col-span-2">
          {/* Assigned Routes Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Assigned Routes</h3>
                <p className="text-sm text-gray-600 mt-1">
                  You have {routes.length} route{routes.length !== 1 ? 's' : ''} assigned
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <MapPin size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Routes Grid */}
          {routes.length > 0 ? (
            <div className="space-y-4">
              {routes.map((route) => (
                <div key={route._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                  {/* Route Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xl font-bold">{route.name}</h4>
                        <p className="text-blue-100 text-sm mt-1">{route.description}</p>
                      </div>
                      <span className="bg-green-500 px-3 py-1 rounded-full text-xs font-semibold">
                        {route.status || 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Route Details */}
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin size={16} className="text-blue-600" />
                          <p className="text-xs font-semibold text-gray-700">Area / City</p>
                        </div>
                        <p className="text-base font-bold text-gray-900">{route.area || route.city}</p>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={16} className="text-purple-600" />
                          <p className="text-xs font-semibold text-gray-700">Assigned Date</p>
                        </div>
                        <p className="text-base font-bold text-gray-900">
                          {route.assignedDate ? new Date(route.assignedDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Route ID */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-5">
                      <p className="text-xs text-gray-500 mb-1">Route ID</p>
                      <p className="text-xs font-mono text-gray-600 break-all">{route._id}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleViewCustomers(route._id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                      >
                        <Users size={16} />
                        View Customers
                      </button>
                      <button 
                        onClick={() => navigate(`/sales?route=${route._id}`)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                      >
                        <ShoppingBag size={16} />
                        View Sales
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Routes Assigned</h3>
              <p className="text-gray-600">You don't have any routes assigned yet. Contact your admin to assign routes.</p>
            </div>
          )}

          {/* Summary Stats */}
          {routes.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Route Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Routes</p>
                  <p className="text-3xl font-bold text-blue-600">{routes.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Active Routes</p>
                  <p className="text-3xl font-bold text-green-600">
                    {routes.filter(r => r.status === 'Active').length}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Areas Covered</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {new Set(routes.map(r => r.area || r.city)).size}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}