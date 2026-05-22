import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X, Plus, Search, Edit2, Trash2, Eye, RefreshCw } from 'lucide-react';
import { apiRequest } from "../api/api";
import { formatCurrency } from "../utils/formatCurrency";

interface Route {
  _id: string;
  name: string;
  city: string;
}

interface Customer {
  _id: string;
  customerId: string;
  customerName: string;
  shopName: string;
  phoneNumber: string;
  whatsapp?: string;
  email?: string;
  address: string;
  location?: string;
  route: Route | string;
  creditLimit: number;
  balance?: number;
  status: string;
  notes?: string;
  createdBy?: {
    _id: string;
    username: string;
    role: string;
  };
  createdAt: string;
}

interface LedgerEntry {
  date: string;
  type: "Sale" | "Payment";
  reference: string;
  amount: number;
  balance: number;
}

export default function Customers() {
  const location = useLocation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [ledgerData, setLedgerData] = useState<{ ledger: LedgerEntry[]; currentBalance: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    shopName: "",
    phoneNumber: "",
    whatsapp: "",
    email: "",
    address: "",
    location: "",
    route: "",
    creditLimit: 0,
    notes: "",
  });

  const loadRoutes = async () => {
    try {
      const response = await apiRequest("/routes");
      const routesData = response.routes || response;
      setRoutes(routesData || []);
    } catch (error) {
      console.error("Error loading routes:", error);
    }
  };

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest("/customers");
      setCustomers(data || []);
      setError(null);
    } catch (error: any) {
      console.error("Error loading customers:", error);
      setError(error.message || "Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    loadRoutes();

    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('createCustomer') === 'true') {
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

  const createCustomer = async () => {
    if (!form.customerName || !form.shopName || !form.phoneNumber || !form.address || !form.route) {
      setError("Please fill all required fields (Customer Name, Shop Name, Phone Number, Address, Route)");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        customerName: form.customerName,
        shopName: form.shopName,
        phoneNumber: form.phoneNumber,
        whatsapp: form.whatsapp || undefined,
        email: form.email || undefined,
        address: form.address,
        location: form.location || undefined,
        route: form.route,
        creditLimit: Number(form.creditLimit) || 0,
        notes: form.notes || undefined,
      };

      if (editingId) {
        await apiRequest(`/customers/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(requestBody),
        });
        setSuccessMessage("Customer updated successfully!");
      } else {
        await apiRequest("/customers", {
          method: "POST",
          body: JSON.stringify(requestBody),
        });
        setSuccessMessage("Customer created successfully!");
      }

      setForm({
        customerName: "",
        shopName: "",
        phoneNumber: "",
        whatsapp: "",
        email: "",
        address: "",
        location: "",
        route: "",
        creditLimit: 0,
        notes: "",
      });
      setEditingId(null);
      setShowCreateForm(false);
      await loadCustomers();
    } catch (error: any) {
      console.error("Error saving customer:", error);
      setError(error.message || "Failed to save customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    const routeId = typeof customer.route === 'object' ? customer.route._id : customer.route;
    
    setForm({
      customerName: customer.customerName,
      shopName: customer.shopName,
      phoneNumber: customer.phoneNumber,
      whatsapp: customer.whatsapp || "",
      email: customer.email || "",
      address: customer.address,
      location: customer.location || "",
      route: routeId,
      creditLimit: customer.creditLimit,
      notes: customer.notes || "",
    });
    setEditingId(customer._id);
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setForm({
      customerName: "",
      shopName: "",
      phoneNumber: "",
      whatsapp: "",
      email: "",
      address: "",
      location: "",
      route: "",
      creditLimit: 0,
      notes: "",
    });
    setEditingId(null);
    setShowCreateForm(false);
  };

  const deleteCustomer = async (id: string, customerName: string) => {
    if (!window.confirm(`Are you sure you want to delete customer "${customerName}"? This action cannot be undone.`)) return;

    try {
      await apiRequest(`/customers/${id}`, { method: "DELETE" });
      await loadCustomers();
      setSuccessMessage("Customer deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      setError(error.message || "Failed to delete customer");
    }
  };

  const viewLedger = async (customer: Customer) => {
    setIsLoading(true);
    try {
      const response = await apiRequest(`/customers/${customer._id}/ledger`);
      setSelectedCustomer(customer);
      setLedgerData({
        ledger: response.ledger || [],
        currentBalance: response.currentBalance || 0,
      });
    } catch (error: any) {
      console.error("Error loading ledger:", error);
      setError(error.message || "Failed to load customer ledger");
    } finally {
      setIsLoading(false);
    }
  };

  const closeLedger = () => {
    setSelectedCustomer(null);
    setLedgerData(null);
  };

  const updateCustomerField = async (customer: Customer, field: string, value: any) => {
    try {
      await apiRequest(`/customers/${customer._id}`, {
        method: "PUT",
        body: JSON.stringify({ [field]: value }),
      });
      await loadCustomers();
      setSuccessMessage("Customer updated successfully!");
    } catch (error: any) {
      console.error("Error updating customer:", error);
      setError(error.message || "Failed to update customer");
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRouteName = (route: Route | string) => {
    if (typeof route === 'object' && route.name) {
      return route.city ? `${route.name} - ${route.city}` : route.name;
    }
    return "Unknown Route";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
        <p className="text-gray-600">Manage customer information, credit limits, and view transaction history</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          <div className="flex items-center gap-2">
            <span className="text-sm">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2">
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Create/Edit Customer Section */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <h2 className="text-lg font-bold text-gray-800">
              {editingId ? "Edit Customer" : "Create New Customer"}
            </h2>
          </div>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
            >
              <Plus size={20} />
              Add Customer
            </button>
          )}
        </div>

        {showCreateForm && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">CUSTOMER NAME *</label>
                <input
                  type="text"
                  placeholder="Kamal Perera"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">SHOP NAME *</label>
                <input
                  type="text"
                  placeholder="Kanai Grocery"
                  value={form.shopName}
                  onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">PHONE NUMBER *</label>
                <input
                  type="text"
                  placeholder="0771234567"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">WHATSAPP</label>
                <input
                  type="text"
                  placeholder="0771234567"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">EMAIL</label>
                <input
                  type="email"
                  placeholder="kamal@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">ADDRESS *</label>
                <input
                  type="text"
                  placeholder="No 10, Main Street, Kandy"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">LOCATION/AREA</label>
                <input
                  type="text"
                  placeholder="Kandy"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">ROUTE *</label>
                <select
                  value={form.route}
                  onChange={(e) => setForm({ ...form, route: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="">Select a route...</option>
                  {routes.map((route) => (
                    <option key={route._id} value={route._id}>
                      {route.city ? `${route.name} - ${route.city}` : route.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">CREDIT LIMIT (LKR)</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={form.creditLimit}
                  onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-2">NOTES</label>
                <textarea
                  placeholder="Additional notes about the customer..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <span>📍</span> Customer ID is auto-generated (CUS-XXX). Created by will be auto-filled from logged-in user.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={createCustomer}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {isLoading ? "Saving..." : editingId ? "Update Customer" : "Create Customer"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customers List Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-bold text-gray-800">My Customers</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 w-64"
              />
            </div>
            <button
              onClick={loadCustomers}
              className="text-blue-600 hover:text-blue-800 p-2"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Shop Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Credit Limit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.customerId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.customerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.shopName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.phoneNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{getRouteName(customer.route)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(customer.creditLimit)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-red-600">{formatCurrency(customer.balance || 0)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => viewLedger(customer)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Ledger"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit Customer"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteCustomer(customer._id, customer.customerName)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Customer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? "No customers found matching your search" : "No customers found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Ledger Modal */}
      {selectedCustomer && ledgerData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Customer Ledger</h3>
                <p className="text-sm text-gray-600">{selectedCustomer.customerName} - {selectedCustomer.shopName}</p>
                <p className="text-xs text-gray-500">Customer ID: {selectedCustomer.customerId}</p>
              </div>
              <button onClick={closeLedger} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600">Date</th>
                    <th className="px-4 py-2 text-left text-gray-600">Type</th>
                    <th className="px-4 py-2 text-left text-gray-600">Reference</th>
                    <th className="px-4 py-2 text-left text-gray-600">Amount</th>
                    <th className="px-4 py-2 text-left text-gray-600">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ledgerData.ledger.length > 0 ? (
                    ledgerData.ledger.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.type === 'Sale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {entry.type}
                          </span>
                        </td>
                        <td className="px-4 py-2">{entry.reference}</td>
                        <td className={`px-4 py-2 font-medium ${entry.type === 'Sale' ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.type === 'Sale' ? '+' : '-'}{formatCurrency(Math.abs(entry.amount))}
                        </td>
                        <td className="px-4 py-2 font-medium">{formatCurrency(entry.balance)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No transactions found for this customer
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className={`text-2xl font-bold ${ledgerData.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(ledgerData.currentBalance)}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  <p>Credit Limit: {formatCurrency(selectedCustomer.creditLimit)}</p>
                  <p className="mt-1">
                    Available Credit: {formatCurrency(selectedCustomer.creditLimit - ledgerData.currentBalance)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Customer Modal */}
      {selectedCustomer && !ledgerData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Update Customer</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  value={selectedCustomer.phoneNumber}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credit Limit (LKR)</label>
                <input
                  type="number"
                  value={selectedCustomer.creditLimit}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, creditLimit: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedCustomer.status}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await updateCustomerField(selectedCustomer, "phoneNumber", selectedCustomer.phoneNumber);
                  await updateCustomerField(selectedCustomer, "creditLimit", selectedCustomer.creditLimit);
                  await updateCustomerField(selectedCustomer, "status", selectedCustomer.status);
                  setSelectedCustomer(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Update Customer
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Salesman can only update customers within their assigned routes
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}