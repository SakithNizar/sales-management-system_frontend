import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import useCustomerStore from '../stores/useCustomerStore';
import { formatCurrency } from '../utils/formatCurrency';
import type { Customer } from '../types';

const routes = ['South Route', 'Central Route', 'North Route', 'West Route', 'Main Street Route', 'Kandy Road'];

export default function Customers() {
  const location = useLocation();
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [form, setForm] = useState({
    name: '',
    shopName: '',
    contact: '',
    whatsapp: '',
    email: '',
    address: '',
    location: '',
    route: '',
    creditLimit: '',
    notes: '',
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('createCustomer') === 'true') {
      setShowCreateForm(true);
    }
  }, [location]);

  const handleCreateCustomer = () => {
    if (!form.name || !form.shopName || !form.contact) {
      alert('Please fill required fields');
      return;
    }
    
    const newCustomer: Customer = {
      id: `CUS-${Date.now()}`,
      name: form.name,
      shopName: form.shopName,
      contact: form.contact,
      email: form.email,
      location: form.location,
      route: form.route,
      creditLimit: parseFloat(form.creditLimit) || 0,
      outstanding: 0,
      status: 'Active',
      joined: new Date().toLocaleDateString(),
    };

    if (editingId) {
      updateCustomer(editingId, newCustomer);
      setEditingId(null);
    } else {
      addCustomer(newCustomer);
    }

    setForm({
      name: '',
      shopName: '',
      contact: '',
      whatsapp: '',
      email: '',
      address: '',
      location: '',
      route: '',
      creditLimit: '',
      notes: '',
    });
    setShowCreateForm(false);
  };

  const handleEditCustomer = (customer: Customer) => {
    setForm({
      name: customer.name,
      shopName: customer.shopName,
      contact: customer.contact,
      whatsapp: '',
      email: customer.email,
      address: '',
      location: customer.location,
      route: customer.route,
      creditLimit: customer.creditLimit.toString(),
      notes: '',
    });
    setEditingId(customer.id);
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setForm({
      name: '',
      shopName: '',
      contact: '',
      whatsapp: '',
      email: '',
      address: '',
      location: '',
      route: '',
      creditLimit: '',
      notes: '',
    });
    setEditingId(null);
    setShowCreateForm(false);
  };

  const filteredCustomers = customers.filter((c: Customer) =>
    c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    c.shopName.toLowerCase().includes(searchCustomer.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Create New Customer Section */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <h2 className="text-lg font-bold text-gray-800">Create New Customer</h2>
          </div>
        </div>

        {showCreateForm ? (
          <div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Row 1 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">CUSTOMER NAME *</label>
                <input
                  type="text"
                  placeholder="Kamal Perera"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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

              {/* Row 2 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">PHONE NUMBER *</label>
                <input
                  type="text"
                  placeholder="0771234567"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
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

              {/* Row 3 */}
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

              {/* Row 4 */}
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
                  <option value="">Main Street Route</option>
                  {routes.map((route) => (
                    <option key={route} value={route}>
                      {route}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 5 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">CREDIT LIMIT (LKR)</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={form.creditLimit}
                  onChange={(e) => setForm({ ...form, creditLimit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">NOTES</label>
                <input
                  type="text"
                  placeholder="Regular wholesale customer"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Footer Note */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <span>📍</span> Auto generates Customer ID: CUS-007. Created by: Nousan Silva
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomer}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 text-sm"
              >
                ✓ {editingId ? 'Update' : 'Create'} Customer
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* My Customers Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">My Customers</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Customer
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Customer ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Shop Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Credit Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer: Customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.shopName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.contact}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.route}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(customer.creditLimit)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(customer.outstanding)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Ledger"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure?')) {
                          deleteCustomer(customer.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No customers found
          </div>
        )}
      </div>

      {/* Customer Ledger Preview Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>📋 Customer Ledger Preview</span>
            {selectedCustomer && <span className="text-sm text-gray-600">({selectedCustomer.shopName})</span>}
          </h2>
          <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Sales + Payments
          </a>
        </div>

        {selectedCustomer ? (
          <div>
            <table className="w-full text-sm mb-6">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3">2025-04-10</td>
                  <td className="px-4 py-3">Sale</td>
                  <td className="px-4 py-3">INV-035</td>
                  <td className="px-4 py-3 text-green-600">+5,000</td>
                  <td className="px-4 py-3">5,000</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">2025-04-11</td>
                  <td className="px-4 py-3">Payment</td>
                  <td className="px-4 py-3">REC-022</td>
                  <td className="px-4 py-3 text-red-600">-2,000</td>
                  <td className="px-4 py-3">3,000</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">2025-04-12</td>
                  <td className="px-4 py-3">Sale</td>
                  <td className="px-4 py-3">INV-038</td>
                  <td className="px-4 py-3 text-green-600">+1,950</td>
                  <td className="px-4 py-3">4,950</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">2025-04-14</td>
                  <td className="px-4 py-3">Payment</td>
                  <td className="px-4 py-3">REC-025</td>
                  <td className="px-4 py-3 text-red-600">-1,950</td>
                  <td className="px-4 py-3">3,000</td>
                </tr>
              </tbody>
            </table>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Current Balance</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(selectedCustomer.outstanding)}</p>
              </div>
              <p className="text-xs text-gray-500">LKR 3,000 (Customer Owes)</p>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <span>ℹ️</span> Download Full Ledger
              </p>
              <p className="text-xs text-gray-500 mt-2">Ledger combines sales invoices and payments with running balance</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Select a customer to view ledger
          </div>
        )}
      </div>

      {/* Update Customer Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>✏️ Update Customer</span>
            {selectedCustomer && <span className="text-sm text-gray-600">(Example)</span>}
          </h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Edit allowed
          </button>
        </div>

        {selectedCustomer ? (
          <div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">SELECT CUSTOMER</label>
              <select
                value={selectedCustomer.id}
                onChange={(e) => {
                  const customer = customers.find(c => c.id === e.target.value);
                  if (customer) setSelectedCustomer(customer);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Load Customer --</option>
                {customers.map((c: Customer) => (
                  <option key={c.id} value={c.id}>
                    {c.shopName} - {c.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">PHONE NUMBER</label>
                <input
                  type="text"
                  value={selectedCustomer.contact}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, contact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CREDIT LIMIT</label>
                <input
                  type="number"
                  value={selectedCustomer.creditLimit}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, creditLimit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">STATUS</label>
                <select
                  value={selectedCustomer.status}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                updateCustomer(selectedCustomer.id, selectedCustomer);
                alert('Customer updated successfully!');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
            >
              🔄 Update Customer
            </button>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Salesman can only update customers within their assigned routes
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Select a customer to update
          </div>
        )}
      </div>
    </div>
  );
}
