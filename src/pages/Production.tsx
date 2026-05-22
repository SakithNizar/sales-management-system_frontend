import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import { Factory, X, Plus, Search, Edit2, Trash2, Package } from 'lucide-react';

// Define types
interface FinishedGood {
  _id: string;
  name: string;
  unit: string;
  shelfLifeDays: number;
  category: string;
  status: string;
}

interface ProductionBatch {
  _id: string;
  batchNo?: string;
  invoiceNo?: string;
  item: string | { _id: string; name: string; category: string; unit: string }; // Can be string or populated object
  date?: string;
  quantity: number;
  unitCost: number;
  expiryDate?: string;
  status: string;
  notes?: string;
  createdAt?: string;
}

export default function Production() {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [finishedGoods, setFinishedGoods] = useState<FinishedGood[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchBatchId, setSearchBatchId] = useState("");
  const [searchResult, setSearchResult] = useState<ProductionBatch | null>(null);
  const [editingBatch, setEditingBatch] = useState<ProductionBatch | null>(null);
  
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    itemId: "",
    quantity: 0,
    unitCost: 0,
    notes: "",
  });

  const loadBatches = async () => {
    try {
      const batchesData = await apiRequest("/production-batches");
      
      // The backend already populates the item field, so we can directly use it
      const batchesWithNames = batchesData.map((batch: ProductionBatch) => {
        // Get item name from populated object or from finishedGoods list
        let itemName = "Unknown Item";
        if (batch.item) {
          if (typeof batch.item === 'object') {
            itemName = batch.item.name;
          } else {
            // If it's still a string ID, look it up
            const item = finishedGoods.find(i => i._id === batch.item);
            itemName = item?.name || "Unknown Item";
          }
        }
        return { ...batch, itemName };
      });
      
      setBatches(batchesWithNames);
    } catch (error) {
      console.error("Error loading batches:", error);
    }
  };

  const loadFinishedGoods = async () => {
    try {
      const data = await apiRequest("/items/finished-goods");
      setFinishedGoods(data);
    } catch (error) {
      console.error("Error loading finished goods:", error);
    }
  };

  useEffect(() => {
    loadFinishedGoods();
  }, []);

  // Load batches after finished goods are loaded
  useEffect(() => {
    if (finishedGoods.length > 0) {
      loadBatches();
    }
  }, [finishedGoods]);

  const calculateExpiryDate = (productionDate: string, shelfLifeDays: number) => {
    if (!shelfLifeDays || shelfLifeDays === 0) return null;
    const date = new Date(productionDate);
    date.setDate(date.getDate() + shelfLifeDays);
    return date.toISOString().split('T')[0];
  };

  const createBatch = async () => {
    if (!form.itemId || !form.quantity || form.quantity <= 0) {
      alert("Please select a finished good and enter a valid quantity");
      return;
    }

    if (form.unitCost < 0) {
      alert("Unit cost cannot be negative");
      return;
    }

    const selectedItem = finishedGoods.find((item) => item._id === form.itemId);
    if (!selectedItem) {
      alert("Selected item not found");
      return;
    }

    try {
      const requestBody = {
        date: form.date,
        itemId: form.itemId,
        quantity: parseInt(form.quantity as any),
        unitCost: parseFloat(form.unitCost as any) || 0,
        notes: form.notes || "",
      };

      await apiRequest("/production-batches", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      
      resetForm();
      setShowCreateForm(false);
      loadBatches();
      alert("Production batch created successfully!");
    } catch (error: any) {
      console.error("Error creating batch:", error);
      alert(error.message || "Error creating production batch");
    }
  };

  const searchBatch = async () => {
    if (!searchBatchId.trim()) return;
    try {
      const result = await apiRequest(`/production-batches/${searchBatchId}`);
      
      // Get item name from populated object or from finishedGoods
      let itemName = "Unknown Item";
      if (result.item) {
        if (typeof result.item === 'object') {
          itemName = result.item.name;
        } else {
          const item = finishedGoods.find(i => i._id === result.item);
          itemName = item?.name || "Unknown Item";
        }
      }
      
      setSearchResult({ ...result, itemName });
    } catch (error) {
      setSearchResult(null);
      alert("Production batch not found");
    }
  };

  const updateBatch = async () => {
    if (!editingBatch?._id) return;
    
    if (editingBatch.quantity <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }
    
    if (editingBatch.unitCost < 0) {
      alert("Unit cost cannot be negative");
      return;
    }
    
    try {
      const requestBody: any = {
        quantity: parseInt(editingBatch.quantity as any),
        unitCost: parseFloat(editingBatch.unitCost as any),
        status: editingBatch.status,
        notes: editingBatch.notes || "",
      };
      
      if (editingBatch.date) {
        requestBody.date = editingBatch.date;
      }
      
      await apiRequest(`/production-batches/${editingBatch._id}`, {
        method: "PUT",
        body: JSON.stringify(requestBody),
      });
      
      setShowEditForm(false);
      setEditingBatch(null);
      loadBatches();
      alert("Production batch updated successfully!");
    } catch (error) {
      console.error("Error updating batch:", error);
      alert("Error updating production batch");
    }
  };

  const deleteBatch = async (id: string) => {
    if (window.confirm("Are you sure? Deleting will remove all record of this production run. This action cannot be undone.")) {
      try {
        await apiRequest(`/production-batches/${id}`, { method: "DELETE" });
        loadBatches();
        alert("Production batch deleted successfully!");
      } catch (error) {
        console.error("Error deleting batch:", error);
        alert("Error deleting production batch");
      }
    }
  };

  const resetForm = () => {
    setForm({
      date: new Date().toISOString().split('T')[0],
      itemId: "",
      quantity: 0,
      unitCost: 0,
      notes: "",
    });
  };

  const startEdit = (batch: ProductionBatch) => {
    // Get the item ID from populated object or string
    let itemId = "";
    if (batch.item) {
      if (typeof batch.item === 'object') {
        itemId = batch.item._id;
      } else {
        itemId = batch.item;
      }
    }
    
    setEditingBatch({ 
      ...batch,
      date: batch.date,
      itemId: itemId,
      quantity: batch.quantity,
      unitCost: batch.unitCost,
      status: batch.status || "Produced",
      notes: batch.notes || "",
    });
    setShowEditForm(true);
  };

  const selectedItem = finishedGoods.find((item) => item._id === form.itemId);
  const totalCost = form.quantity * form.unitCost;
  const expiryDate = selectedItem ? calculateExpiryDate(form.date, selectedItem.shelfLifeDays) : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Factory size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Production Batch Management</h1>
        </div>
        <p className="text-gray-600">Manage production batches, track manufacturing, and monitor finished goods</p>
      </div>

      {/* Add Production Batch Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {showCreateForm ? "Create New Production Batch" : "Production Batches"}
          </h2>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Plus size={20} />
              Create Production Batch
            </button>
          )}
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Factory size={24} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Create New Production Batch</h3>
              </div>
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
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>📋 Auto-generation:</strong> Batch numbers and invoice numbers are generated automatically by the backend.</p>
                <p><strong>⏰ Expiry Date:</strong> Automatically calculated from production date + item's shelf life (only for Finished Goods).</p>
                <p><strong>✅ Validation:</strong> Only Finished Goods with "Active" status can be produced.</p>
                <p><strong>💰 Total Cost:</strong> Quantity × Unit Cost = Total Production Cost</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Production Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Finished Good *</label>
                <select
                  value={form.itemId}
                  onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose a finished good...</option>
                  {finishedGoods.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} - {item.unit} {item.shelfLifeDays ? `(${item.shelfLifeDays} days shelf life)` : ''}
                    </option>
                  ))}
                </select>
                {finishedGoods.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No finished goods available. Please create finished goods in Item Management first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Produced *</label>
                <input
                  type="number"
                  placeholder="500"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost (₹) *</label>
                <input
                  type="number"
                  placeholder="120.00"
                  step="0.01"
                  value={form.unitCost}
                  onChange={(e) => setForm({ ...form, unitCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  placeholder="Example: Morning production batch - Line A, Quality check passed"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {selectedItem && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-green-700 font-semibold">Selected Product</p>
                    <p className="text-sm font-medium text-green-900">{selectedItem.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700 font-semibold">Unit</p>
                    <p className="text-sm text-green-900">{selectedItem.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700 font-semibold">Shelf Life</p>
                    <p className="text-sm text-green-900">{selectedItem.shelfLifeDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700 font-semibold">Expiry Date</p>
                    <p className="text-sm font-medium text-green-900">{expiryDate || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700 font-semibold">Total Cost</p>
                    <p className="text-sm font-bold text-green-900">₹{totalCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700 font-semibold">Status</p>
                    <p className="text-sm text-green-900">Produced (auto-set)</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={createBatch}
                disabled={!form.itemId || form.quantity <= 0}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
                  !form.itemId || form.quantity <= 0
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Plus size={20} />
                Create Production Batch
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

      {/* Search Batch Section */}
      <div className="mb-8 bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Production Batch</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter batch ID"
            value={searchBatchId}
            onChange={(e) => setSearchBatchId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchBatch()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={searchBatch}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Search size={20} />
            Search Batch
          </button>
        </div>

        {searchResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Batch ID</p>
                <p className="text-sm font-semibold text-blue-900">{searchResult._id}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Batch Number</p>
                <p className="text-sm font-semibold text-blue-900">{searchResult.batchNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Invoice Number</p>
                <p className="text-sm font-semibold text-blue-900">{searchResult.invoiceNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Product</p>
                <p className="text-sm font-semibold text-blue-900">{searchResult.itemName || 'Unknown Item'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Production Date</p>
                <p className="text-sm font-semibold text-blue-900">{searchResult.date}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Quantity</p>
                <p className="text-sm font-semibold text-blue-900">{searchResult.quantity} units</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Unit Cost</p>
                <p className="text-sm font-semibold text-blue-900">₹{searchResult.unitCost}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Total Cost</p>
                <p className="text-sm font-semibold text-blue-900">
                  ₹{(searchResult.quantity * searchResult.unitCost).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Expiry Date</p>
                <p className="text-sm font-semibold text-blue-900">{searchResult.expiryDate || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Status</p>
                <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                  searchResult.status === 'Produced' ? 'bg-blue-100 text-blue-800' :
                  searchResult.status === 'Packed' ? 'bg-green-100 text-green-800' :
                  searchResult.status === 'Dispatched' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {searchResult.status || 'Produced'}
                </span>
              </div>
              {searchResult.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-blue-600 font-semibold uppercase">Notes</p>
                  <p className="text-sm text-blue-900">{searchResult.notes}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-blue-500 mt-4">
              Created: {searchResult.createdAt ? new Date(searchResult.createdAt).toLocaleString() : 'N/A'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Batch Modal */}
      {showEditForm && editingBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Update Production Batch</h3>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingBatch(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-700">
                <strong>✏️ Update Information:</strong> Modifying quantity or unit cost will automatically update total cost. 
                Changing the production date may affect the expiry date based on the product's shelf life.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                <input
                  type="text"
                  value={editingBatch.batchNo || 'Auto-generated'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                <input
                  type="text"
                  value={editingBatch.invoiceNo || 'Auto-generated'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Production Date</label>
                <input
                  type="date"
                  value={editingBatch.date || ''}
                  onChange={(e) => setEditingBatch({ ...editingBatch, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editingBatch.status || 'Produced'}
                  onChange={(e) => setEditingBatch({ ...editingBatch, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Produced">Produced</option>
                  <option value="Packed">Packed</option>
                  <option value="Dispatched">Dispatched</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={editingBatch.quantity}
                  onChange={(e) => setEditingBatch({ ...editingBatch, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingBatch.unitCost}
                  onChange={(e) => setEditingBatch({ ...editingBatch, unitCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={editingBatch.notes || ''}
                  onChange={(e) => setEditingBatch({ ...editingBatch, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700">
                <strong>Total Cost:</strong> ₹{((editingBatch.quantity || 0) * (editingBatch.unitCost || 0)).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={updateBatch}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                <Edit2 size={20} />
                Update Batch
              </button>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingBatch(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Production Batches Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">All Production Batches</h3>
          <button
            onClick={loadBatches}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Batch No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Production Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Cost</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Cost</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {batches.length > 0 ? (
                batches.map((batch) => (
                  <tr key={batch._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{batch.batchNo || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{batch.invoiceNo || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {batch.itemName || (batch.item && typeof batch.item === 'object' ? batch.item.name : 'Unknown Item')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{batch.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{batch.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">₹{batch.unitCost}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ₹{(batch.quantity * batch.unitCost).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{batch.expiryDate || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        batch.status === 'Produced' ? 'bg-blue-100 text-blue-800' :
                        batch.status === 'Packed' ? 'bg-green-100 text-green-800' :
                        batch.status === 'Dispatched' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {batch.status || 'Produced'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => startEdit(batch)}
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition"
                        title="Edit Batch"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteBatch(batch._id)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition"
                        title="Delete Batch"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Package size={48} className="text-gray-300" />
                      <p>No production batches found</p>
                      <p className="text-sm">Click "Create Production Batch" to get started</p>
                    </div>
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