import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import { Package, X, Plus, Search, Edit2, Trash2 } from 'lucide-react';

export default function ItemManagement() {
  const [items, setItems] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [form, setForm] = useState({
    name: "",
    category: "Finished Good",
    unit: "Bottle",
    sellingPrice: 0,
    shelfLifeDays: 0,
    minimumLevel: 0,
    hasBatch: false,
    status: "Active",
  });

  const loadItems = async () => {
    try {
      const data = await apiRequest("/items");
      setItems(data);
    } catch (error) {
      console.error("Error loading items:", error);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const createItem = async () => {
    if (!form.name.trim()) {
      alert("Please fill all required fields");
      return;
    }
    
    // Validation for selling price on Finished Goods
    if (form.category === "Finished Good" && form.sellingPrice <= 0) {
      alert("Finished Goods must have a valid selling price greater than 0");
      return;
    }
    
    try {
      const requestBody: any = {
        name: form.name,
        category: form.category,
        unit: form.unit,
        shelfLifeDays: parseInt(form.shelfLifeDays as any) || 0,
        minimumLevel: parseInt(form.minimumLevel as any) || 0,
        hasBatch: form.hasBatch,
        status: form.status,
      };
      
      // Only include sellingPrice for Finished Goods
      if (form.category === "Finished Good") {
        requestBody.sellingPrice = parseFloat(form.sellingPrice as any) || 0;
      }
      
      await apiRequest("/items", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      resetForm();
      setShowCreateForm(false);
      loadItems();
    } catch (error) {
      alert("Error creating item");
    }
  };

  const searchItem = async () => {
    if (!searchId.trim()) return;
    try {
      const result = await apiRequest(`/items/${searchId}`);
      setSearchResult(result);
    } catch (error) {
      setSearchResult(null);
      alert("Item not found");
    }
  };

  const updateItem = async () => {
    if (!editingItem._id) return;
    
    // Validation for selling price on Finished Goods
    if (editingItem.category === "Finished Good" && editingItem.sellingPrice <= 0) {
      alert("Finished Goods must have a valid selling price greater than 0");
      return;
    }
    
    try {
      const requestBody: any = {
        name: editingItem.name,
        category: editingItem.category,
        unit: editingItem.unit,
        shelfLifeDays: editingItem.shelfLifeDays,
        minimumLevel: editingItem.minimumLevel,
        status: editingItem.status,
      };
      
      // Only include sellingPrice for Finished Goods
      if (editingItem.category === "Finished Good") {
        requestBody.sellingPrice = parseFloat(editingItem.sellingPrice) || 0;
      }
      
      await apiRequest(`/items/${editingItem._id}`, {
        method: "PUT",
        body: JSON.stringify(requestBody),
      });
      setShowEditForm(false);
      setEditingItem(null);
      loadItems();
    } catch (error) {
      alert("Error updating item");
    }
  };

  const deleteItem = async (id: string) => {
    if (window.confirm("Are you sure? This action is irreversible.")) {
      try {
        await apiRequest(`/items/${id}`, { method: "DELETE" });
        loadItems();
      } catch (error) {
        alert("Error deleting item");
      }
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      category: "Finished Good",
      unit: "Bottle",
      sellingPrice: 0,
      shelfLifeDays: 0,
      minimumLevel: 0,
      hasBatch: false,
      status: "Active",
    });
  };

  const startEdit = (item: any) => {
    setEditingItem({ ...item });
    setShowEditForm(true);
  };

  // Auto-manage hasBatch and shelfLifeDays based on category
  const handleCategoryChange = (category: string, isEditing: boolean = false) => {
    if (isEditing && editingItem) {
      const updatedItem = { ...editingItem, category };
      if (category === "Raw Material") {
        updatedItem.shelfLifeDays = 0;
        updatedItem.hasBatch = false;
      } else if (category === "Finished Good") {
        updatedItem.hasBatch = true;
      }
      setEditingItem(updatedItem);
    } else {
      const updatedForm = { ...form, category };
      if (category === "Raw Material") {
        updatedForm.shelfLifeDays = 0;
        updatedForm.hasBatch = false;
        updatedForm.sellingPrice = 0;
      } else if (category === "Finished Good") {
        updatedForm.hasBatch = true;
      }
      setForm(updatedForm);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Package size={32} className="text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Item Management</h1>
        </div>
        <p className="text-gray-600">Manage inventory items, categories, pricing, and shelf life</p>
      </div>

      {/* Create Item Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {showCreateForm ? "Create New Item" : "Items"}
          </h2>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Plus size={20} />
              Create Item
            </button>
          )}
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Create New Item</h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                <strong>Auto Logic:</strong> If category = "Finished Good" → hasBatch = true, shelfLifeDays respected, selling price required. 
                If category = "Raw Material" → hasBatch = false, shelfLifeDays forced to 0, no selling price.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  placeholder="Vanilla Yogurt Drink"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value, false)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="Finished Good">Finished Good</option>
                  <option value="Raw Material">Raw Material</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="Bottle">Bottle</option>
                  <option value="Liter">Liter</option>
                  <option value="Kg">Kg</option>
                  <option value="Gram">Gram</option>
                  <option value="Piece">Piece</option>
                  <option value="Box">Box</option>
                  <option value="Box">Cup</option>
                </select>
              </div>

              {form.category === "Finished Good" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="120.00"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shelf Life (Days)</label>
                <input
                  type="number"
                  placeholder="7"
                  value={form.shelfLifeDays}
                  onChange={(e) => setForm({ ...form, shelfLifeDays: parseInt(e.target.value) || 0 })}
                  disabled={form.category === "Raw Material"}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 ${
                    form.category === "Raw Material" ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
                {form.category === "Raw Material" && (
                  <p className="text-xs text-gray-500 mt-1">Raw materials have no shelf life tracking</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Level (Stock Alert)</label>
                <input
                  type="number"
                  placeholder="100"
                  value={form.minimumLevel}
                  onChange={(e) => setForm({ ...form, minimumLevel: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  id="hasBatch"
                  checked={form.hasBatch}
                  onChange={(e) => setForm({ ...form, hasBatch: e.target.checked })}
                  disabled={form.category === "Finished Good"}
                  className={`w-4 h-4 text-purple-600 rounded ${
                    form.category === "Finished Good" ? "cursor-not-allowed" : ""
                  }`}
                />
                <label htmlFor="hasBatch" className="text-sm font-medium text-gray-700">
                  Has Batch {form.category === "Finished Good" && "(Auto-enabled for Finished Goods)"}
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createItem}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                <Plus size={20} />
                Create Item
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Item Section */}
      <div className="mb-8 bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Item by ID</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter item ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchItem()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={searchItem}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Search size={20} />
            Search
          </button>
        </div>

        {searchResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-2">Name: <span className="font-semibold">{searchResult.name}</span></p>
            <p className="text-sm text-blue-600 mb-2">Category: <span className="font-semibold">{searchResult.category}</span></p>
            <p className="text-sm text-blue-600 mb-2">Unit: <span className="font-semibold">{searchResult.unit}</span></p>
            {searchResult.category === "Finished Good" && searchResult.sellingPrice && (
              <p className="text-sm text-blue-600 mb-2">Selling Price: <span className="font-semibold">₹{searchResult.sellingPrice}</span></p>
            )}
            <p className="text-sm text-blue-600 mb-2">Shelf Life: <span className="font-semibold">{searchResult.shelfLifeDays} days</span></p>
            <p className="text-sm text-blue-600 mb-2">Minimum Level: <span className="font-semibold">{searchResult.minimumLevel}</span></p>
            <p className="text-sm text-blue-600">Status: <span className="font-semibold">{searchResult.status}</span></p>
            <p className="text-xs text-blue-500 mt-3">Created: {new Date(searchResult.createdAt).toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Edit Item Modal */}
      {showEditForm && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Edit Item</h3>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-700">
                <strong>Smart update logic:</strong> If category changed to "Raw Material" → shelfLifeDays = 0, hasBatch = false, selling price removed. 
                If changed to "Finished Good" → hasBatch = true (shelfLifeDays preserved), selling price required.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={editingItem.category}
                  onChange={(e) => handleCategoryChange(e.target.value, true)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="Finished Good">Finished Good</option>
                  <option value="Raw Material">Raw Material</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <select
                  value={editingItem.unit}
                  onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="Bottle">Bottle</option>
                  <option value="Liter">Liter</option>
                  <option value="Kg">Kg</option>
                  <option value="Gram">Gram</option>
                  <option value="Piece">Piece</option>
                  <option value="Box">Box</option>
                </select>
              </div>

              {editingItem.category === "Finished Good" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.sellingPrice || 0}
                    onChange={(e) => setEditingItem({ ...editingItem, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shelf Life (Days)</label>
                <input
                  type="number"
                  value={editingItem.shelfLifeDays}
                  onChange={(e) => setEditingItem({ ...editingItem, shelfLifeDays: parseInt(e.target.value) || 0 })}
                  disabled={editingItem.category === "Raw Material"}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 ${
                    editingItem.category === "Raw Material" ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Level</label>
                <input
                  type="number"
                  value={editingItem.minimumLevel}
                  onChange={(e) => setEditingItem({ ...editingItem, minimumLevel: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editingItem.status}
                  onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm">
              <p className="text-gray-700">
                <strong>Note:</strong> Batch tracking is automatically managed based on category selection.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={updateItem}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                <Edit2 size={20} />
                Update Item
              </button>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingItem(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">All Items</h3>
          <button
            onClick={loadItems}
            className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Selling Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Shelf Life</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Has Batch</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Min Level</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.category === 'Finished Good'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.category === 'Finished Good' && item.sellingPrice ? (
                        <span className="font-semibold text-green-600">₹{item.sellingPrice}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.shelfLifeDays} days</td>
                    <td className="px-6 py-4 text-sm">
                      {item.hasBatch ? (
                        <span className="text-green-600">✓ Yes</span>
                      ) : (
                        <span className="text-red-600">✗ No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.minimumLevel}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteItem(item._id)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}