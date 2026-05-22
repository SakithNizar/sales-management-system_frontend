import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiRequest } from "../api/api";
import { Users, X, Plus, Search, Edit2, Trash2, MapPin, Brain, Pin, UserCheck, UserX, Loader, AlertCircle, CheckCircle } from 'lucide-react';

function routePreviewTitle(name: string) {
  if (!name?.trim()) return "";
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatRouteName(route: any) {
  if (route.routeName) return route.routeName;
  if (route.name && route.city) return `${route.name} - ${route.city}`;
  if (route.name) return route.name;
  if (route.city) return route.city;
  return "Unnamed Route";
}

interface User {
  _id: string;
  fullName: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  status: string;
  assignedRoutes?: any[];
  createdAt?: string;
}

interface Route {
  _id: string;
  name?: string;
  city?: string;
  routeName?: string;
}

export default function UserManagement() {
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignRoutes, setShowAssignRoutes] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [selectedSalesmanId, setSelectedSalesmanId] = useState("");
  const [selectedSalesman, setSelectedSalesman] = useState<User | null>(null);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [routesAssignedToOthers, setRoutesAssignedToOthers] = useState<Set<string>>(new Set());
  
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    email: "",
    phoneNumber: "",
    role: "salesman",
  });
  
  const [formErrors, setFormErrors] = useState({
    fullName: "",
    username: "",
    password: "",
    email: "",
    phoneNumber: "",
  });
  
  const [editForm, setEditForm] = useState({
    fullName: "",
    newUsername: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    status: "",
  });
  
  const [editFormErrors, setEditFormErrors] = useState({
    fullName: "",
    newUsername: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest("/users");
      setUsers(data);
      setError(null);
    } catch (error: any) {
      console.error("Error loading users:", error);
      setError(error.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoutes = async () => {
    try {
      const response = await apiRequest("/routes");
      const routes = response.routes || response;
      setAvailableRoutes(routes || []);
    } catch (error) {
      console.error("Error loading routes:", error);
      setAvailableRoutes([]);
    }
  };

  const loadRoutesAssignedToOthers = async (currentSalesmanId: string) => {
    try {
      const assigned = new Set<string>();
      const salesmen = users.filter(user => user.role === "salesman" && user._id !== currentSalesmanId);
      
      for (const salesman of salesmen) {
        if (salesman.assignedRoutes && salesman.assignedRoutes.length > 0) {
          salesman.assignedRoutes.forEach((route: any) => {
            const routeId = typeof route === 'object' ? route._id : route;
            if (routeId) {
              assigned.add(routeId);
            }
          });
        }
      }
      
      setRoutesAssignedToOthers(assigned);
    } catch (error) {
      console.error("Error loading routes assigned to others:", error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoutes();
    
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

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const validateFullName = (name: string) => {
    if (!name || name.trim().length === 0) return "Full name is required";
    if (name.trim().length < 2) return "Full name must be at least 2 characters";
    return null;
  };

  const validateUsername = (username: string) => {
    if (!username || username.trim().length === 0) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters long";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return null;
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    return null;
  };

  const validateEmail = (email: string) => {
    if (email && email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return "Please enter a valid email address";
    }
    return null;
  };

  const validatePhoneNumber = (phone: string) => {
    if (phone && phone.trim().length > 0) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) return "Phone number must be 10 digits";
    }
    return null;
  };

  const validateCreateForm = () => {
    const errors = {
      fullName: validateFullName(form.fullName) || "",
      username: validateUsername(form.username) || "",
      password: validatePassword(form.password) || "",
      email: validateEmail(form.email) || "",
      phoneNumber: validatePhoneNumber(form.phoneNumber) || "",
    };
    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== "");
  };

  const validateEditForm = () => {
    const errors = {
      fullName: editForm.fullName ? validateFullName(editForm.fullName) || "" : "",
      newUsername: editForm.newUsername ? validateUsername(editForm.newUsername) || "" : "",
      email: editForm.email ? validateEmail(editForm.email) || "" : "",
      phoneNumber: editForm.phoneNumber ? validatePhoneNumber(editForm.phoneNumber) || "" : "",
      password: editForm.password ? validatePassword(editForm.password) || "" : "",
    };
    setEditFormErrors(errors);
    return !Object.values(errors).some(error => error !== "");
  };

  const createUser = async () => {
    if (!validateCreateForm()) return;
    setIsLoading(true);
    setError(null);
    try {
      const requestBody = {
        fullName: form.fullName.trim(),
        username: form.username.trim().toLowerCase(),
        password: form.password,
        email: form.email?.trim() || undefined,
        phoneNumber: form.phoneNumber?.trim() || undefined,
        role: form.role,
      };
      await apiRequest("/users", { method: "POST", body: JSON.stringify(requestBody) });
      setForm({ fullName: "", username: "", password: "", email: "", phoneNumber: "", role: "salesman" });
      setFormErrors({ fullName: "", username: "", password: "", email: "", phoneNumber: "" });
      setShowCreateForm(false);
      await loadUsers();
      setSuccessMessage("User created successfully!");
    } catch (error: any) {
      console.error("Error creating user:", error);
      setError(error.message || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  const searchUser = async () => {
    if (!searchUsername.trim()) {
      setError("Please enter a username to search");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiRequest(`/users/${searchUsername}`);
      setSearchResult(result);
      setSuccessMessage(`User "${result.username}" found!`);
    } catch (error: any) {
      console.error("Error searching user:", error);
      setSearchResult(null);
      setError(error.message || "User not found");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async () => {
    if (!editingUser) return;
    if (!validateEditForm()) return;
    setIsLoading(true);
    setError(null);
    try {
      const updateData: any = {};
      if (editForm.fullName && editForm.fullName !== editingUser.fullName) updateData.fullName = editForm.fullName.trim();
      if (editForm.newUsername) updateData.newUsername = editForm.newUsername.trim().toLowerCase();
      if (editForm.email && editForm.email !== editingUser.email) updateData.email = editForm.email.trim();
      if (editForm.phoneNumber && editForm.phoneNumber !== editingUser.phoneNumber) updateData.phoneNumber = editForm.phoneNumber.trim();
      if (editForm.password) updateData.password = editForm.password;
      if (editForm.role && editForm.role !== editingUser.role) updateData.role = editForm.role;
      if (editForm.status && editForm.status !== editingUser.status) updateData.status = editForm.status;

      if (Object.keys(updateData).length === 0) {
        setError("No changes to update");
        setShowEditForm(false);
        return;
      }

      await apiRequest(`/users/${editingUser.username}`, { method: "PUT", body: JSON.stringify(updateData) });
      setShowEditForm(false);
      setEditingUser(null);
      setEditForm({ fullName: "", newUsername: "", email: "", phoneNumber: "", password: "", role: "", status: "" });
      setEditFormErrors({ fullName: "", newUsername: "", email: "", phoneNumber: "", password: "" });
      await loadUsers();
      setSuccessMessage("User updated successfully!");
    } catch (error: any) {
      console.error("Error updating user:", error);
      setError(error.message || "Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  const activateUser = async (username: string) => {
    try {
      setError(null);
      await apiRequest(`/users/${username}/activate`, { method: "PUT" });
      await loadUsers();
      setSuccessMessage(`User "${username}" activated successfully!`);
    } catch (error: any) {
      console.error("Error activating user:", error);
      setError(error.message || "Failed to activate user");
    }
  };

  const deactivateUser = async (username: string) => {
    try {
      setError(null);
      await apiRequest(`/users/${username}/deactivate`, { method: "PUT" });
      await loadUsers();
      setSuccessMessage(`User "${username}" deactivated successfully!`);
    } catch (error: any) {
      console.error("Error deactivating user:", error);
      setError(error.message || "Failed to deactivate user");
    }
  };

  const deleteUser = async (username: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) return;
    try {
      setError(null);
      await apiRequest(`/users/${username}`, { method: "DELETE" });
      await loadUsers();
      setSuccessMessage(`User "${username}" deleted successfully!`);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      setError(error.message || "Failed to delete user");
    }
  };

  const loadSalesmanRoutes = async (userId: string) => {
    try {
      const user = await apiRequest(`/users/${userId}`);
      if (user && user.assignedRoutes && user.assignedRoutes.length > 0) {
        const routeIds = user.assignedRoutes.map((r: any) => {
          if (typeof r === 'object' && r._id) return r._id;
          if (typeof r === 'string') return r;
          return null;
        }).filter((id: string | null) => id !== null);
        setSelectedRoutes(routeIds);
      } else {
        setSelectedRoutes([]);
      }
    } catch (error) {
      console.error("Error loading salesman routes:", error);
      setSelectedRoutes([]);
    }
  };

  const openAssignRoutesModal = async (user: User) => {
    setSelectedSalesmanId(user._id);
    setSelectedSalesman(user);
    setSelectedRoutes([]);
    setShowAssignRoutes(true);
    await loadSalesmanRoutes(user._id);
    await loadRoutesAssignedToOthers(user._id);
  };

  const openAssignRoutesPanel = () => {
    setSelectedSalesmanId("");
    setSelectedSalesman(null);
    setSelectedRoutes([]);
    setRoutesAssignedToOthers(new Set());
    setShowAssignRoutes(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || "",
      newUsername: "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      password: "",
      role: user.role || "",
      status: user.status || "",
    });
    setEditFormErrors({ fullName: "", newUsername: "", email: "", phoneNumber: "", password: "" });
    setShowEditForm(true);
  };

  const assignRoutes = async () => {
    if (!selectedSalesmanId) {
      setError("Please select a salesman");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await apiRequest(`/users/${selectedSalesmanId}/assign-routes`, {
        method: "POST",
        body: JSON.stringify({ routeIds: selectedRoutes }),
      });
      setShowAssignRoutes(false);
      setSelectedSalesman(null);
      setSelectedSalesmanId("");
      await loadUsers();
      setSuccessMessage("Routes assigned successfully!");
    } catch (error: any) {
      console.error("Error assigning routes:", error);
      setError(error.message || "Failed to assign routes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteToggle = (routeId: string) => {
    setSelectedRoutes((prev) =>
      prev.includes(routeId) ? prev.filter((id) => id !== routeId) : [...prev, routeId]
    );
  };

  const isRouteAssignedToOthers = (routeId: string) => routesAssignedToOthers.has(routeId);

  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} />
            <p className="text-sm">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Create User Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">{showCreateForm ? "Create New User" : "User Management"}</h2>
          <div className="flex gap-2">
            <button onClick={openAssignRoutesPanel} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
              <MapPin size={20} /> Assign Routes
            </button>
            {!showCreateForm && (
              <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                <Plus size={20} /> Create User
              </button>
            )}
          </div>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Create New User</h3>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700 font-semibold mb-2">Validation Requirements:</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li><strong>Full Name:</strong> Required, minimum 2 characters</li>
                <li><strong>Username:</strong> Required, minimum 3 characters, only letters, numbers, and underscores</li>
                <li><strong>Password:</strong> Required, minimum 8 characters</li>
                <li><strong>Email:</strong> Optional, must be valid email format if provided</li>
                <li><strong>Phone Number:</strong> Optional, must be 10 digits (Sri Lankan format)</li>
              </ul>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label><input type="text" placeholder="Kamal Perera" value={form.fullName} onChange={(e) => { setForm({ ...form, fullName: e.target.value }); setFormErrors({ ...formErrors, fullName: "" }); }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'}`} />{formErrors.fullName && <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Username *</label><input type="text" placeholder="kamal_p" value={form.username} onChange={(e) => { setForm({ ...form, username: e.target.value }); setFormErrors({ ...formErrors, username: "" }); }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${formErrors.username ? 'border-red-500' : 'border-gray-300'}`} />{formErrors.username && <p className="text-xs text-red-500 mt-1">{formErrors.username}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Password *</label><input type="password" placeholder="Minimum 8 characters" value={form.password} onChange={(e) => { setForm({ ...form, password: e.target.value }); setFormErrors({ ...formErrors, password: "" }); }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`} />{formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label><input type="email" placeholder="kamal@erp.com" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setFormErrors({ ...formErrors, email: "" }); }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`} />{formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</label><input type="tel" placeholder="0771234567" value={form.phoneNumber} onChange={(e) => { setForm({ ...form, phoneNumber: e.target.value }); setFormErrors({ ...formErrors, phoneNumber: "" }); }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`} />{formErrors.phoneNumber && <p className="text-xs text-red-500 mt-1">{formErrors.phoneNumber}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Role *</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"><option value="salesman">Salesman</option><option value="admin">Admin</option><option value="production_manager">Production Manager</option><option value="store_manager">Store Manager</option></select></div>
            </div>
            <div className="flex gap-3">
              <button onClick={createUser} disabled={isLoading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50">{isLoading ? <Loader size={20} className="animate-spin" /> : <Plus size={20} />} Create User</button>
              <button onClick={() => setShowCreateForm(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">Cancel</button>
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
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            <Search size={20} /> Search
          </button>
        </div>

        {searchResult && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-blue-200">
              <div className="bg-blue-100 rounded-full p-3">
                <Users size={32} className="text-blue-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">{searchResult.fullName}</h4>
                <p className="text-sm text-gray-600">@{searchResult.username}</p>
              </div>
              <div className="ml-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${searchResult.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {searchResult.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Role</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{searchResult.role}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{searchResult.email || 'N/A'}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Phone Number</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{searchResult.phoneNumber || 'N/A'}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Created At</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{searchResult.createdAt ? new Date(searchResult.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>

            {searchResult.role === "salesman" && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-blue-600" />
                  <h5 className="font-semibold text-gray-800">Assigned Routes</h5>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {searchResult.assignedRoutes?.length || 0} routes
                  </span>
                </div>
                
                {searchResult.assignedRoutes && searchResult.assignedRoutes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {searchResult.assignedRoutes.map((route: any, idx: number) => {
                      const routeName = typeof route === 'object' ? formatRouteName(route) : availableRoutes.find(r => r._id === route)?.name || route;
                      const routeCity = typeof route === 'object' ? route.city : null;
                      return (
                        <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 min-w-[200px] shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-semibold text-green-800">{routeName}</span>
                          </div>
                          {routeCity && <p className="text-xs text-gray-600 mt-1 ml-4">City: {routeCity}</p>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <MapPin size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No routes assigned to this salesman</p>
                    <button onClick={() => openAssignRoutesModal(searchResult)} className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium">+ Assign Routes</button>
                  </div>
                )}
              </div>
            )}

            {searchResult.role !== "salesman" && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-gray-400" />
                  <p className="text-sm text-gray-500">Route assignment is only available for Salesman role</p>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-blue-200">User ID: {searchResult._id}</p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditForm && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Edit User: {editingUser.username}</h3>
              <button onClick={() => setShowEditForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"><p className="text-sm text-yellow-700"><strong>Note:</strong> Leave fields blank to keep current values.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label><input type="text" value={editForm.fullName} onChange={(e) => { setEditForm({ ...editForm, fullName: e.target.value }); setEditFormErrors({ ...editFormErrors, fullName: "" }); }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${editFormErrors.fullName ? 'border-red-500' : 'border-gray-300'}`} />{editFormErrors.fullName && <p className="text-xs text-red-500 mt-1">{editFormErrors.fullName}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">New Username</label><input type="text" placeholder="Leave blank to keep current" value={editForm.newUsername} onChange={(e) => { setEditForm({ ...editForm, newUsername: e.target.value }); setEditFormErrors({ ...editFormErrors, newUsername: "" }); }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${editFormErrors.newUsername ? 'border-red-500' : 'border-gray-300'}`} />{editFormErrors.newUsername && <p className="text-xs text-red-500 mt-1">{editFormErrors.newUsername}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" value={editForm.email} onChange={(e) => { setEditForm({ ...editForm, email: e.target.value }); setEditFormErrors({ ...editFormErrors, email: "" }); }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${editFormErrors.email ? 'border-red-500' : 'border-gray-300'}`} />{editFormErrors.email && <p className="text-xs text-red-500 mt-1">{editFormErrors.email}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label><input type="tel" value={editForm.phoneNumber} onChange={(e) => { setEditForm({ ...editForm, phoneNumber: e.target.value }); setEditFormErrors({ ...editFormErrors, phoneNumber: "" }); }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${editFormErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`} />{editFormErrors.phoneNumber && <p className="text-xs text-red-500 mt-1">{editFormErrors.phoneNumber}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">New Password</label><input type="password" placeholder="Leave blank to keep current (min 8 chars)" value={editForm.password} onChange={(e) => { setEditForm({ ...editForm, password: e.target.value }); setEditFormErrors({ ...editFormErrors, password: "" }); }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${editFormErrors.password ? 'border-red-500' : 'border-gray-300'}`} />{editFormErrors.password && <p className="text-xs text-red-500 mt-1">{editFormErrors.password}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Role</label><select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"><option value="">Select role...</option><option value="salesman">Salesman</option><option value="admin">Admin</option><option value="production_manager">Production Manager</option><option value="store_manager">Store Manager</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Status</label><select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"><option value="">Select status...</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            </div>
            <div className="flex gap-3">
              <button onClick={updateUser} disabled={isLoading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50">{isLoading ? <Loader size={20} className="animate-spin" /> : <Edit2 size={20} />} Update User</button>
              <button onClick={() => setShowEditForm(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* All Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-800">All Users</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length > 0 ? users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                  <td className="px-6 py-4 text-sm"><span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{user.role}</span></td>
                  <td className="px-6 py-4 text-sm"><span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{user.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.phoneNumber || '—'}</td>
                  <td className="px-6 py-4 text-sm flex gap-2 flex-wrap">
                    {user.role === "salesman" && (<button onClick={() => openAssignRoutesModal(user)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition" title="Assign routes"><MapPin size={16} /></button>)}
                    <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition" title="Edit user"><Edit2 size={16} /></button>
                    {user.status === 'active' ? (<button onClick={() => deactivateUser(user.username)} className="text-yellow-600 hover:text-yellow-800 p-1 hover:bg-yellow-50 rounded transition" title="Deactivate user"><UserX size={16} /></button>) : (<button onClick={() => activateUser(user.username)} className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition" title="Activate user"><UserCheck size={16} /></button>)}
                    <button onClick={() => deleteUser(user.username)} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition" title="Delete user"><Trash2 size={16} /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500"><Users size={48} className="mx-auto text-gray-300 mb-2" />No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Routes Modal */}
      {showAssignRoutes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <MapPin size={28} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">{selectedSalesman ? `Assign Routes to ${selectedSalesman.fullName}` : "Assign Routes to Salesman"}</h3>
              </div>
              <button onClick={() => { setShowAssignRoutes(false); setSelectedSalesman(null); setSelectedSalesmanId(""); }} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            {!selectedSalesman && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">SELECT SALESMAN</label>
                <select value={selectedSalesmanId} onChange={async (e) => { const id = e.target.value; setSelectedSalesmanId(id); if (id) { await loadSalesmanRoutes(id); await loadRoutesAssignedToOthers(id); const salesman = users.find(u => u._id === id); setSelectedSalesman(salesman || null); } else { setSelectedRoutes([]); setSelectedSalesman(null); setRoutesAssignedToOthers(new Set()); } }} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a salesman...</option>
                  {users.filter((user) => user.role === "salesman").map((user) => (<option key={user._id} value={user._id}>{user.fullName} (Username: {user.username})</option>))}
                </select>
              </div>
            )}

            {selectedSalesman && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-blue-700"><strong>Salesman:</strong> {selectedSalesman.fullName}</p><p className="text-sm text-blue-700 mt-1"><strong>Username:</strong> {selectedSalesman.username}</p></div>
                  <div><p className="text-sm text-blue-700"><strong>Currently Assigned Routes:</strong> <span className="ml-2 font-bold">{selectedRoutes.length}</span></p><p className="text-sm text-blue-700 mt-1"><strong>Status:</strong> <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${selectedSalesman.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{selectedSalesman.status}</span></p></div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="mb-4 block text-sm font-bold uppercase tracking-wide text-gray-700">ROUTES MANAGEMENT</label>
              <div className="mb-5 flex flex-col gap-2 max-h-96 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50">
                {availableRoutes.length > 0 ? availableRoutes.map((route) => {
                  const routeId = route._id;
                  const isAssignedToCurrent = selectedRoutes.includes(routeId);
                  const isAssignedToOthers = isRouteAssignedToOthers(routeId);
                  const routeDisplayName = formatRouteName(route);
                  let bgColorClass = "", borderColorClass = "", textColorClass = "", statusText = "", statusIcon = "";
                  if (isAssignedToCurrent) { bgColorClass = "bg-green-50"; borderColorClass = "border-green-400"; textColorClass = "text-green-800"; statusText = "Currently assigned to this salesman"; statusIcon = "✓"; }
                  else if (isAssignedToOthers) { bgColorClass = "bg-gray-100"; borderColorClass = "border-gray-300"; textColorClass = "text-gray-500"; statusText = "Assigned to another salesman"; statusIcon = "❌"; }
                  else { bgColorClass = "bg-white"; borderColorClass = "border-gray-300"; textColorClass = "text-gray-800"; statusText = "Available for assignment"; statusIcon = "☐"; }
                  return (
                    <label key={routeId} className={`flex cursor-pointer select-none items-center gap-3 rounded-lg border p-3 transition ${!selectedSalesmanId || isAssignedToOthers ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed" : isAssignedToCurrent ? `${borderColorClass} ${bgColorClass} shadow-sm` : "border-gray-300 bg-white hover:bg-gray-50"}`}>
                      <input type="checkbox" checked={isAssignedToCurrent} disabled={!selectedSalesmanId || isAssignedToOthers} onChange={() => handleRouteToggle(routeId)} className="h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between"><span className={`text-sm font-semibold ${textColorClass}`}>{routeDisplayName}</span><span className={`text-xs px-2 py-1 rounded-full ${isAssignedToCurrent ? 'bg-green-100 text-green-700' : isAssignedToOthers ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>{statusIcon} {statusText}</span></div>
                        {route.city && <p className="text-xs text-gray-500 mt-1">City: {route.city}</p>}
                      </div>
                    </label>
                  );
                }) : <p className="text-sm text-gray-500 text-center py-4">No routes available. Please create routes first.</p>}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-green-50 border border-green-400 rounded flex items-center justify-center"><span className="text-green-700 text-xs">✓</span></div><span>Currently assigned (can be unchecked)</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-gray-100 border border-gray-300 rounded flex items-center justify-center"><span className="text-gray-500 text-xs">❌</span></div><span>Assigned to another salesman (locked)</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-white border border-gray-300 rounded"></div><span>Available for assignment</span></div>
              </div>

              <div className="w-full rounded-md border border-amber-100 bg-amber-50 px-4 py-3 mt-4">
                <p className="flex items-start gap-2.5 text-left text-sm leading-relaxed text-gray-700">
                  <Brain className="mt-0.5 h-[18px] w-[18px] shrink-0 text-pink-400" />
                  <span><strong>How to manage routes:</strong><br />• <span className="text-green-700 font-medium">Green checked routes</span> = Currently assigned. <strong>Uncheck to remove</strong> this route from the salesman.<br />• <span className="text-gray-500">Grayed out routes</span> = Assigned to other salesmen. Cannot be modified.<br />• <span className="text-blue-700">White routes</span> = Available. <strong>Check to assign</strong> new routes to this salesman.<br />• Click <strong>"Update Assigned Routes"</strong> to save all changes at once.</span>
                </p>
              </div>
            </div>

            <div className="mb-6 text-left">
              <button onClick={assignRoutes} disabled={!selectedSalesmanId || isLoading} className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white shadow-sm transition ${selectedSalesmanId && !isLoading ? "bg-blue-600 hover:bg-blue-700 cursor-pointer" : "bg-gray-400 cursor-not-allowed opacity-60"}`}>
                {isLoading ? <Loader size={20} className="animate-spin" /> : <Pin size={20} />}
                {selectedRoutes.length > 0 ? "Update Assigned Routes" : "Remove All Routes"}
              </button>
              <p className="mt-2 text-xs text-gray-500">{selectedRoutes.length > 0 ? `You have ${selectedRoutes.length} route(s) selected. Click update to save changes.` : "No routes selected. Click update to remove all route assignments for this salesman."}</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                <p className="shrink-0 text-sm font-bold text-gray-700">Summary of selected routes:</p>
                {selectedRoutes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedRoutes.map((id) => {
                      const route = availableRoutes.find((r) => r._id === id);
                      const routeName = route ? formatRouteName(route) : id;
                      return <span key={id} className="inline-flex items-center rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-900">✓ {routeName}</span>;
                    })}
                  </div>
                ) : <p className="text-sm italic text-gray-500">No routes selected. This salesman will have no assigned routes.</p>}
              </div>
            </div>

            <div className="border-t border-gray-200 mt-8 pt-6">
              <button onClick={() => { setShowAssignRoutes(false); setSelectedSalesman(null); setSelectedSalesmanId(""); }} className="w-full rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}