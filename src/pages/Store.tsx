import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import { Plus, X, Eye, Trash2, Package, TrendingDown } from 'lucide-react';

export default function Store() {
  const [items, setItems] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [stockInRecords, setStockInRecords] = useState<any[]>([]);
  const [stockOutRecords, setStockOutRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("stockin");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Stock IN state
  const [inItems, setInItems] = useState<any[]>([]);
  const [inSource, setInSource] = useState("Production");
  const [inManager, setInManager] = useState("");

  // Stock OUT state
  const [outItems, setOutItems] = useState<any[]>([]);
  const [outManager, setOutManager] = useState("");

  const loadData = async () => {
    try {
      const [itemsData, batchesData, stockInData, stockOutData] = await Promise.all([
        apiRequest("/items"),
        apiRequest("/production-batches"),
        apiRequest("/stock-in"),
        apiRequest("/stock-out"),
      ]);
      setItems(itemsData || []);
      setBatches(batchesData || []);
      setStockInRecords(stockInData || []);
      setStockOutRecords(stockOutData || []);
    } catch (error) {
      console.error("Error loading store data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Stock IN Methods
  const addInItem = () => {
    setInItems([
      ...inItems,
      {
        id: Date.now(),
        productId: "",
        batchNo: "",
        quantity: 0,
        unitCost: 0,
        expiryDate: "",
      },
    ]);
  };

  const updateInItem = (id: number, field: string, value: any) => {
    setInItems(
      inItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              ...(field === "productId" && {
                batchNo: "",
                expiryDate: items.find((i) => i._id === value)?.category === "Finished Good"
                  ? batches
                      .filter((b) => b.selectedFinishedGood === value)
                      .slice(-1)[0]?.batchNo || ""
                  : "",
              }),
            }
          : item
      )
    );
  };

  const removeInItem = (id: number) => {
    setInItems(inItems.filter((item) => item.id !== id));
  };

  const recordStockIn = async () => {
    if (inItems.length === 0 || !inManager) {
      alert("Please add items and enter manager name");
      return;
    }

    try {
      const invoiceNo = `ST-IN-${Date.now().toString().slice(-6)}`;
      await apiRequest("/stock-in", {
        method: "POST",
        body: JSON.stringify({
          invoiceNo,
          date: new Date().toISOString().split("T")[0],
          source: inSource,
          manager: inManager,
          items: inItems,
          totalCost: inItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0),
          totalItems: inItems.length,
        }),
      });
      setInItems([]);
      setInManager("");
      loadData();
      alert("Stock IN recorded successfully!");
    } catch (error) {
      alert("Error recording Stock IN");
    }
  };

  // Stock OUT Methods
  const addOutItem = () => {
    setOutItems([
      ...outItems,
      {
        id: Date.now(),
        productId: "",
        batchNo: "",
        quantity: 0,
        unitCost: 0,
      },
    ]);
  };

  const updateOutItem = (id: number, field: string, value: any) => {
    setOutItems(
      outItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeOutItem = (id: number) => {
    setOutItems(outItems.filter((item) => item.id !== id));
  };

  const recordStockOut = async () => {
    if (outItems.length === 0 || !outManager) {
      alert("Please add items and enter manager name");
      return;
    }

    try {
      const invoiceNo = `ST-OUT-${Date.now().toString().slice(-6)}`;
      await apiRequest("/stock-out", {
        method: "POST",
        body: JSON.stringify({
          invoiceNo,
          date: new Date().toISOString().split("T")[0],
          manager: outManager,
          items: outItems,
          totalCost: outItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0),
          totalItems: outItems.length,
        }),
      });
      setOutItems([]);
      setOutManager("");
      loadData();
      alert("Stock OUT recorded successfully!");
    } catch (error) {
      alert("Error recording Stock OUT");
    }
  };

  const getTotalInCost = () =>
    inItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitCost || 0), 0);
  const getTotalOutCost = () =>
    outItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitCost || 0), 0);

  const getProductName = (id: string) => items.find((i) => i._id === id)?.name || "";
  const getProductCategory = (id: string) =>
    items.find((i) => i._id === id)?.category || "";
  const getProductUnit = (id: string) => items.find((i) => i._id === id)?.unit || "";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Management</h1>
        <p className="text-gray-600">Manage inventory Stock IN and Stock OUT</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("stockin")}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === "stockin"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Package size={20} className="inline mr-2" /> Stock IN
        </button>
        <button
          onClick={() => setActiveTab("stockout")}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === "stockout"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <TrendingDown size={20} className="inline mr-2" /> Stock OUT
        </button>
      </div>

      {/* STOCK IN TAB */}
      {activeTab === "stockin" && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>📌 Auto Features:</strong> Finished Goods (Batch required) get batch details from
              production. Raw Materials (Batch optional) - enter manually. Expiry date auto-fills for
              Finished Goods.
            </p>
          </div>

          {/* Stock IN Form */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Stock IN - {inSource === "Production" ? "Production Mode" : "Purchase Mode"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <select
                  value={inSource}
                  onChange={(e) => setInSource(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Production">Production Mode (Batch required)</option>
                  <option value="Purchase">Purchase Mode (Manual quantity)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Manager Name *</label>
                <input
                  type="text"
                  placeholder="Enter manager name"
                  value={inManager}
                  onChange={(e) => setInManager(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-4 mb-6">
              {inItems.map((item, index) => {
                const product = items.find((i) => i._id === item.productId);
                const isFinishedGood = product?.category === "Finished Good";

                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800">Product {index + 1}</h4>
                      <button
                        onClick={() => removeInItem(item.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SELECT PRODUCT *
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => updateInItem(item.id, "productId", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Choose a product...</option>
                          {items.map((i) => (
                            <option key={i._id} value={i._id}>
                              {i.name} ({i.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      {isFinishedGood ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            BATCH NO (FG ONLY)
                          </label>
                          <select
                            value={item.batchNo}
                            onChange={(e) => updateInItem(item.id, "batchNo", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Select batch...</option>
                            {batches
                              .filter((b) => b.selectedFinishedGood === item.productId)
                              .map((b) => (
                                <option key={b._id} value={b.batchNo}>
                                  {b.batchNo}
                                </option>
                              ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            BATCH NO (OPTIONAL)
                          </label>
                          <input
                            type="text"
                            placeholder="--"
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          QUANTITY *
                        </label>
                        <input
                          type="number"
                          placeholder="500"
                          value={item.quantity}
                          onChange={(e) =>
                            updateInItem(item.id, "quantity", parseInt(e.target.value) || 0)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          UNIT COST (LKR) *
                        </label>
                        <input
                          type="number"
                          placeholder="120"
                          value={item.unitCost}
                          onChange={(e) =>
                            updateInItem(item.id, "unitCost", parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {isFinishedGood ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            EXPIRY DATE
                          </label>
                          <input
                            type="date"
                            value={item.expiryDate}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                            disabled
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            EXPIRY DATE (OPTIONAL)
                          </label>
                          <input
                            type="date"
                            value={item.expiryDate}
                            onChange={(e) => updateInItem(item.id, "expiryDate", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Item Button */}
            <button
              onClick={addInItem}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium mb-6 transition"
            >
              <Plus size={20} />
              Add Another Product
            </button>

            {/* Total */}
            {inItems.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  <strong>Total Items: {inItems.length} | Total Cost: LKR{" "}
                  {getTotalInCost().toLocaleString()} (Auto-calc)</strong>
                </p>
              </div>
            )}

            {/* Record Button */}
            <button
              onClick={recordStockIn}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              <Plus size={20} />
              Record Stock IN
            </button>
          </div>

          {/* Stock IN List */}
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Stock IN List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Invoice No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Total Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Manager
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockInRecords.length > 0 ? (
                    stockInRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {record.invoiceNo}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.source}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.totalItems}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          LKR {record.totalCost?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.manager}</td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setSelectedInvoice({ ...record, type: "in" })}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No Stock IN records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STOCK OUT TAB */}
      {activeTab === "stockout" && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>📌 Stock OUT:</strong> Finished Goods deducted from location (PFD). Raw Materials
              deducted from total quantity.
            </p>
          </div>

          {/* Stock OUT Form */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Stock OUT - Dispatch Items</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Manager Name *</label>
              <input
                type="text"
                placeholder="Enter manager name"
                value={outManager}
                onChange={(e) => setOutManager(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Items List */}
            <div className="space-y-4 mb-6">
              {outItems.map((item, index) => {
                const product = items.find((i) => i._id === item.productId);
                const isFinishedGood = product?.category === "Finished Good";

                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800">Product {index + 1}</h4>
                      <button
                        onClick={() => removeOutItem(item.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => updateOutItem(item.id, "productId", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Choose a product...</option>
                          {items.map((i) => (
                            <option key={i._id} value={i._id}>
                              {i.name} - {i.category}
                            </option>
                          ))}
                        </select>
                      </div>

                      {isFinishedGood ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Batch (FG Only)
                          </label>
                          <select
                            value={item.batchNo}
                            onChange={(e) => updateOutItem(item.id, "batchNo", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Select batch...</option>
                            {batches
                              .filter((b) => b.selectedFinishedGood === item.productId)
                              .map((b) => (
                                <option key={b._id} value={b.batchNo}>
                                  {b.batchNo}
                                </option>
                              ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Batch
                          </label>
                          <input
                            type="text"
                            placeholder="--"
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Qty</label>
                        <input
                          type="number"
                          placeholder="200"
                          value={item.quantity}
                          onChange={(e) =>
                            updateOutItem(item.id, "quantity", parseInt(e.target.value) || 0)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          UnitCost
                        </label>
                        <input
                          type="number"
                          placeholder="120"
                          value={item.unitCost}
                          onChange={(e) =>
                            updateOutItem(item.id, "unitCost", parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Item Button */}
            <button
              onClick={addOutItem}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium mb-6 transition"
            >
              <Plus size={20} />
              Add Product to Dispatch
            </button>

            {/* Total */}
            {outItems.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  <strong>Total Items: {outItems.length} | Total Cost: LKR{" "}
                  {getTotalOutCost().toLocaleString()} (Auto-calc)</strong>
                </p>
              </div>
            )}

            {/* Record Button */}
            <button
              onClick={recordStockOut}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              <Plus size={20} />
              Record Stock OUT
            </button>
          </div>

          {/* Stock OUT List */}
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Stock OUT Records</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Invoice No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Total Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Manager
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockOutRecords.length > 0 ? (
                    stockOutRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {record.invoiceNo}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.totalItems}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          LKR {record.totalCost?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.manager}</td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setSelectedInvoice({ ...record, type: "out" })}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No Stock OUT records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-3xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedInvoice.type === "in" ? "Stock IN" : "Stock OUT"} Invoice Detail
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-gray-600">Invoice:</p>
                <p className="font-semibold text-gray-900">{selectedInvoice.invoiceNo}</p>
              </div>
              <div>
                <p className="text-gray-600">Date:</p>
                <p className="font-semibold text-gray-900">{selectedInvoice.date}</p>
              </div>
              <div>
                <p className="text-gray-600">Manager:</p>
                <p className="font-semibold text-gray-900">{selectedInvoice.manager}</p>
              </div>
              {selectedInvoice.source && (
                <div>
                  <p className="text-gray-600">Source:</p>
                  <p className="font-semibold text-gray-900">{selectedInvoice.source}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600">Item</th>
                      <th className="px-4 py-2 text-left text-gray-600">Batch</th>
                      <th className="px-4 py-2 text-left text-gray-600">Qty</th>
                      <th className="px-4 py-2 text-left text-gray-600">UnitCost</th>
                      <th className="px-4 py-2 text-left text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="px-4 py-2">{item.productId}</td>
                        <td className="px-4 py-2">{item.batchNo || "--"}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">LKR {item.unitCost}</td>
                        <td className="px-4 py-2 font-semibold">
                          LKR {(item.quantity * item.unitCost).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}