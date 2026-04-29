import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import { Factory, X, Plus, Search, Edit2, Trash2 } from 'lucide-react';

export default function Production() {
  const [batches, setBatches] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchBatchId, setSearchBatchId] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  
  const [form, setForm] = useState({
    productionDate: new Date().toISOString().split('T')[0],
    selectedFinishedGood: "",
    quantityProduced: 0,
    unitCost: 0,
    notes: "",
  });

  const loadBatches = async () => {
    try {
      const data = await apiRequest("/production-batches");
      setBatches(data);
    } catch (error) {
      console.error("Error loading batches:", error);
    }
  };

  const loadItems = async () => {
    try {
      const data = await apiRequest("/items");
      // Filter only Finished Goods
      setItems(data.filter((item: any) => item.category === "Finished Good"));
    } catch (error) {
      console.error("Error loading items:", error);
    }
  };

  useEffect(() => {
    loadBatches();
    loadItems();
  }, []);

  const generateBatchNo = () => {
    const today = new Date();
    const date = today.toISOString().split('T')[0].replace(/-/g, '').slice(2);
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `BY-${date}${random}`;
  };

  const generateInvoiceNo = () => {
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `PR-${random}`;
  };

  const calculateExpiryDate = (productionDate: string, shelfLifeDays: number) => {
    const date = new Date(productionDate);
    date.setDate(date.getDate() + shelfLifeDays);
    return date.toISOString().split('T')[0];
  };

  const createBatch = async () => {
    if (!form.selectedFinishedGood || !form.quantityProduced) {
      alert("Please fill all required fields");
      return;
    }

    const selectedItem = items.find((item) => item._id === form.selectedFinishedGood);
    if (!selectedItem) {
      alert("Item not found");
      return;
    }

    try {
      const expiryDate = calculateExpiryDate(form.productionDate, selectedItem.shelfLifeDays);
      await apiRequest("/production-batches", {
        method: "POST",
        body: JSON.stringify({
          batchNo: generateBatchNo(),
          invoiceNo: generateInvoiceNo(),
          productionDate: form.productionDate,
          selectedFinishedGood: form.selectedFinishedGood,
          quantityProduced: parseInt(form.quantityProduced as any),
          unitCost: parseFloat(form.unitCost as any),
          expiryDate,
          status: "Produced",
          notes: form.notes,
        }),
      });
      resetForm();
      setShowCreateForm(false);
      loadBatches();
    } catch (error) {
      alert("Error creating batch");
    }
  };

  const searchBatch = async () => {
    if (!searchBatchId.trim()) return;
    try {
      const result = await apiRequest(`/production-batches/${searchBatchId}`);
      setSearchResult(result);
    } catch (error) {
      setSearchResult(null);
      alert("Batch not found");
    }
  };

  const updateBatch = async () => {
    if (!editingBatch._id) return;
    try {
      await apiRequest(`/production-batches/${editingBatch._id}`, {
        method: "PUT",
        body: JSON.stringify({
          quantityProduced: editingBatch.quantityProduced,
          unitCost: editingBatch.unitCost,
          status: editingBatch.status,
          notes: editingBatch.notes,
        }),
      });
      setShowEditForm(false);
      setEditingBatch(null);
      loadBatches();
    } catch (error) {
      alert("Error updating batch");
    }
  };

  const deleteBatch = async (id: string) => {
    if (window.confirm("Are you sure? Deleting will remove all record of this production run.")) {
      try {
        await apiRequest(`/production-batches/${id}`, { method: "DELETE" });
        loadBatches();
      } catch (error) {
        alert("Error deleting batch");
      }
    }
  };

  const resetForm = () => {
    setForm({
      productionDate: new Date().toISOString().split('T')[0],
      selectedFinishedGood: "",
      quantityProduced: 0,
      unitCost: 0,
      notes: "",
    });
  };

  const startEdit = (batch: any) => {
    setEditingBatch({ ...batch });
    setShowEditForm(true);
  };

  const selectedItem = items.find((item) => item._id === form.selectedFinishedGood);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Production Batch</h1>
        <p className="text-gray-600">Manage production batches and track manufacturing</p>
      </div>

      {/* Add Production Batch Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {showCreateForm ? "Add Production Batch" : "Production"}
          </h2>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Plus size={20} />
              Add Production Batch
            </button>
          )}
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Factory size={24} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Add Production Batch</h3>
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
                <p><strong>Auto-generation:</strong> Batch No (BY-1001, BY-1002...) and Invoice No (PR-001, PR-002...) are generated automatically.</p>
                <p><strong>Expiry Date:</strong> Auto-calculated from production date + item shelfLifeDays (only for Finished Goods).</p>
                <p><strong>Validation:</strong> Only Finished Goods can be produced (Raw Materials are rejected).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Production Date *</label>
                <input
                  type="date"
                  value={form.productionDate}
                  onChange={(e) => setForm({ ...form, productionDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Finished Good *</label>
                <select
                  value={form.selectedFinishedGood}
                  onChange={(e) => setForm({ ...form, selectedFinishedGood: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose an item...</option>
                  {items.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Produced *</label>
                <input
                  type="number"
                  placeholder="500"
                  value={form.quantityProduced}
                  onChange={(e) => setForm({ ...form, quantityProduced: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost (LKR) *</label>
                <input
                  type="number"
                  placeholder="120"
                  step="0.01"
                  value={form.unitCost}
                  onChange={(e) => setForm({ ...form, unitCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  placeholder="Morning production batch - Line A"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {selectedItem && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-700">
                  ✓ <strong>Auto Fields:</strong> Batch No: {generateBatchNo()} | Invoice No: {generateInvoiceNo()} | Expiry Date: {calculateExpiryDate(form.productionDate, selectedItem.shelfLifeDays)} (product + {selectedItem.shelfLifeDays}d shelf life)
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={createBatch}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
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
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Get Production Batch</h3>
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
            Fetch Batch
          </button>
        </div>

        {searchResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Batch No</p>
                <p className="text-sm font-semibold text-blue-900">{searchResult.batchNo}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Invoice No</p>
                <p className="text-sm font-semibold text-blue-900">{searchResult.invoiceNo}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Product</p>
                <p className="text-sm font-semibold text-blue-900">{searchResult.selectedFinishedGood}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Production Date</p>
                <p className="text-sm font-semibold text-blue-900">{searchResult.productionDate}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Quantity</p>
                <p className="text-sm font-semibold text-blue-900">{searchResult.quantityProduced} units</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Unit Cost</p>
                <p className="text-sm font-semibold text-blue-900">LKR {searchResult.unitCost}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Total Cost</p>
                <p className="text-sm font-semibold text-blue-900">LKR {(searchResult.quantityProduced * searchResult.unitCost).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Expiry Date</p>
                <p className="text-sm font-semibold text-blue-900">{searchResult.expiryDate}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Status</p>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  searchResult.status === 'Produced' ? 'bg-blue-100 text-blue-800' :
                  searchResult.status === 'Packed' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {searchResult.status}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-blue-600 font-semibold uppercase">Notes</p>
                <p className="text-sm text-blue-900">{searchResult.notes || 'N/A'}</p>
              </div>
            </div>
            <p className="text-xs text-blue-500 mt-4">
              Created: {new Date(searchResult.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Edit Batch Modal */}
      {showEditForm && editingBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-2xl w-full">
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
                <strong>Update logic:</strong> If item changed, auto date recalculates based on new item's shelf life. Total cost auto-recalculates if Quantity or Unit Cost changes. Status can change (Produced → Packed → Unpacked).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch ID (PATH)</label>
                <input
                  type="text"
                  value={editingBatch._id || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={editingBatch.quantityProduced}
                  onChange={(e) => setEditingBatch({ ...editingBatch, quantityProduced: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingBatch.unitCost}
                  onChange={(e) => setEditingBatch({ ...editingBatch, unitCost: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editingBatch.status}
                  onChange={(e) => setEditingBatch({ ...editingBatch, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Produced">Produced</option>
                  <option value="Packed">Packed</option>
                  <option value="Unpacked">Unpacked</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={editingBatch.notes}
                  onChange={(e) => setEditingBatch({ ...editingBatch, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm">
              <p className="text-gray-700">
                <strong>Note updated:</strong> Unit Cost × Quantity = Total Cost (will be auto updated based on changes). Change in production date will affect the expiry date.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={updateBatch}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                <Edit2 size={20} />
                Update Batch Details
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product (Item)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
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
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{batch.batchNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{batch.invoiceNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{batch.selectedFinishedGood}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{batch.productionDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{batch.quantityProduced}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{batch.unitCost}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {(batch.quantityProduced * batch.unitCost).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{batch.expiryDate}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        batch.status === 'Produced' ? 'bg-blue-100 text-blue-800' :
                        batch.status === 'Packed' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => startEdit(batch)}
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteBatch(batch._id)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    No production batches found
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
