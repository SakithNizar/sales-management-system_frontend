import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiRequest } from "../api/api";
import { Users, X, Plus, Search, Edit2, Trash2, MapPin, Brain, Pin } from "lucide-react";

function routePreviewTitle(name: string) {
  if (!name?.trim()) return "";
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function UserManagement() {
  const location = useLocation();
  const [users, setUsers] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignRoutes, setShowAssignRoutes] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);
  const [selectedSalesmanId, setSelectedSalesmanId] = useState("");
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    email: "",
    phoneNumber: "",
    role: "salesman",
    status: "active",
  });

  const loadUsers = async () => {
    const data = await apiRequest("/users");
    setUsers(data);
  };

  const loadRoutes = async () => {
    try {
      const data = await apiRequest("/routes");
      setAvailableRoutes(data || []);
    } catch (error) {
      console.error("Error loading routes:", error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoutes();
    
    // Check if assignRoutes query param is set to open the modal
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('assignRoutes') === 'true') {
      setSelectedSalesmanId("");
      setSelectedRoutes([]);
      setShowAssignRoutes(true);
    }
    if (searchParams.get('createUser') === 'true') {
      setShowCreateForm(true);
    }
  }, [location]);

  const createUser = async () => {
    if (!form.fullName || !form.username || !form.password) {
      alert("Please fill all required fields");
      return;
    }
    try {
      await apiRequest("/users", {
        method: "POST",
        body: JSON.stringify({
          ...form,
        }),
      });
      setForm({ fullName: "", username: "", password: "", email: "", phoneNumber: "", role: "salesman", status: "active" });
      setShowCreateForm(false);
      loadUsers();
    } catch (error) {
      alert("Error creating user");
    }
  };

  const searchUser = async () => {
    if (!searchUsername.trim()) return;
    try {
      const result = await apiRequest(`/users/${searchUsername}`);
      setSearchResult(result);
    } catch (error) {
      setSearchResult(null);
      alert("User not found");
    }
  };

  

  const deleteUser = async (username: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
    await apiRequest(`/users/${username}`, { method: "DELETE" });
    loadUsers();
    } catch (error) {
    alert("Error deleting user");
    }
  };


  const loadSalesmanRoutes = async (userId: string) => {
    try {
      const userRoutes = await apiRequest(`/users/${userId}/routes`);
      setSelectedRoutes(userRoutes?.routes ?? userRoutes?.assignedRoutes ?? []);
    } catch {
      setSelectedRoutes([]);
    }
  };

  
  const openAssignRoutesModal = (user: any) => {
    setSelectedSalesmanId(user._id);
    setSelectedRoutes(user.assignedRoutes || []);
    setShowAssignRoutes(true);
  };


  const openAssignRoutesPanel = () => {
    setSelectedSalesmanId("");
    setSelectedRoutes([]);
    setShowAssignRoutes(true);
  };

  const assignRoutes = async () => {
    if (!selectedSalesmanId) {
      alert("Please select a salesman");
      return;
    }
    try {
      await apiRequest(`/users/${selectedSalesmanId}/assign-routes`, {
        method: "PUT",
        body: JSON.stringify({ routeIds: selectedRoutes }),
      });
      setShowAssignRoutes(false);
      alert("Routes assigned successfully!");
      loadUsers();
    } catch {
      alert("Error assigning routes");
    }
  };

  const handleRouteToggle = (routeId: string) => {
    setSelectedRoutes((prev) =>
      prev.includes(routeId)
        ? prev.filter((id) => id !== routeId)
        : [...prev, routeId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Users size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        </div>
        <p className="text-gray-600">Manage users, roles, and permissions for your system</p>
      </div>

      {/* Create User Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {showCreateForm ? "Create New User" : "User Management"}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openAssignRoutesPanel}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <MapPin size={20} />
              Assign Routes
            </button>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                <Plus size={20} />
                Create User
              </button>
            )}
          </div>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Create New User</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  placeholder="Kamal Perera"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                <input
                  type="text"
                  placeholder="kamal_p"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="kamal@erp.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (GS1-LKANA)</label>
                <input
                  type="tel"
                  placeholder="077534567"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="salesman">Salesman</option>
                  <option value="admin">Admin</option>
                  <option value="production_manager">Production Manager</option>
                  <option value="store_manager">Store Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createUser}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                <Plus size={20} />
                Create User
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search User Section */}
      <div className="mb-8 bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Search User by Username</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter username"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUser()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={searchUser}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Search size={20} />
            Search
          </button>
        </div>

        {searchResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-2">Full name: <span className="font-semibold">{searchResult.fullName}</span></p>
            <p className="text-sm text-blue-600 mb-2">Username: <span className="font-semibold">{searchResult.username}</span></p>
            <p className="text-sm text-blue-600 mb-2">Role: <span className="font-semibold">{searchResult.role}</span></p>
            <p className="text-sm text-blue-600 mb-2">Status: <span className="font-semibold">{searchResult.status}</span></p>
            <p className="text-sm text-blue-600">Email: <span className="font-semibold">{searchResult.email || 'N/A'}</span></p>
            <p className="text-xs text-blue-500 mt-3">Created At: {new Date(searchResult.createdAt).toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* All Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">All Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.phoneNumber || '—'}</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      {user.role === "salesman" && (
                        <button
                          onClick={() => openAssignRoutesModal(user)}
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                          title="Assign routes"
                        >
                          <MapPin size={16} />
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteUser(user.username)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Routes Modal */}
      {showAssignRoutes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <MapPin size={28} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Assign Routes to Salesman</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">specialized endpoint</span>
                <button
                  type="button"
                  onClick={() => setShowAssignRoutes(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* API Endpoint Display */}
            <div className="text-right mb-6">
              <p className="text-xs text-gray-500 font-mono">POST /api/users/{selectedSalesmanId || "userId"}/assign-routes</p>
            </div>

            {/* Salesman Selection */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3 tracking-wide">SALESMAN (USER ID / NAME)</label>
              <select
                value={selectedSalesmanId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedSalesmanId(id);
                  if (id) void loadSalesmanRoutes(id);
                  else setSelectedRoutes([]);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a salesman...</option>
                {users
                  .filter((user) => user.role === "salesman")
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.fullName} (ID: {user._id})
                    </option>
                  ))}
              </select>
            </div>

            {/* Available Routes (multi-select) */}
            <div className="mb-6">
              <label className="mb-4 block text-sm font-bold uppercase tracking-wide text-gray-700">
                AVAILABLE ROUTES (MULTI-SELECT)
              </label>
              <div className="mb-5 flex flex-wrap gap-2">
                {availableRoutes.length > 0 ? (
                  availableRoutes.map((route) => {
                    const checked = selectedRoutes.includes(route._id);
                    const label = route.routeName || route.name;
                    return (
                      <label
                        key={route._id}
                        className={`inline-flex cursor-pointer select-none items-center gap-2.5 rounded-full border px-3 py-2 pl-3 pr-4 transition ${!selectedSalesmanId
                            ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                            : checked
                              ? "border-blue-200 bg-blue-100"
                              : "border-gray-200 bg-gray-50"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!selectedSalesmanId}
                          onChange={() => handleRouteToggle(route._id)}
                          className="h-4 w-4 shrink-0 rounded border-gray-300 text-[#3182CE] focus:ring-[#3182CE]"
                        />
                        <span className="text-sm font-semibold uppercase tracking-wide text-gray-800">
                          {label}
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No routes available</p>
                )}
              </div>

              <div className="w-full rounded-md border border-amber-100 bg-[#FFFBEB] px-4 py-3">
                <p className="flex items-start gap-2.5 text-left text-sm italic leading-relaxed text-gray-700">
                  <Brain
                    className="mt-0.5 h-[18px] w-[18px] shrink-0 text-pink-400"
                    aria-hidden
                    strokeWidth={1.75}
                  />
                  <span>
                    Backend logic: prevents route double-assignment to multiple salesmen, validates route IDs
                    exist.
                  </span>
                </p>
              </div>
            </div>

            <div className="mb-6 text-left">
              <button
                type="button"
                onClick={assignRoutes}
                disabled={!selectedSalesmanId}
                className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-sm transition ${selectedSalesmanId
                    ? "bg-[#3182CE] hover:bg-[#2B6CB0] cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed opacity-60"
                  }`}
              >
                <Pin className="h-5 w-5 shrink-0 text-red-500" aria-hidden strokeWidth={2.5} />
                Assign Routes (Mock)
              </button>
              <p className="mt-2 max-w-xl text-xs italic text-gray-500">
                Selected routeIds array sent to backend. Returns updated assignedRoutes.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                <p className="shrink-0 text-sm font-bold text-gray-700">Current assigned routes preview:</p>
                {selectedRoutes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedRoutes.map((id) => {
                      const route = availableRoutes.find((r) => r._id === id);
                      const routeName = route?.routeName || route?.name || id;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-900"
                        >
                          {routePreviewTitle(routeName)}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-500">None selected.</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 mt-8 pt-6">
              <button
                type="button"
                onClick={() => setShowAssignRoutes(false)}
                className="w-full rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}