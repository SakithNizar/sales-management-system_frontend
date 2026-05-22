import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import { Plus, X, Eye, Package, TrendingDown, Factory, ShoppingCart, LayoutDashboard, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface Item {
  _id: string;
  name: string;
  category: string;
  unit: string;
  shelfLifeDays: number;
  sellingPrice?: number;
  status: string;
  minimumLevel?: number;
}

interface StockInItem {
  id: number;
  item: string;
  batchNo: string;
  quantity: number;
  unitCost: number;
  expiryDate: string;
}

interface StockInFlatRecord {
  _id?: string;
  stockInId: string;
  date: string;
  invoiceNo: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  store: string;
  manager: string;
  remarks: string;
  expiryDate: string;
}

interface StockInFullInvoice {
  _id: string;
  date: string;
  invoiceNo: string;
  source: string;
  manager: string;
  items: Array<{
    item: Item;
    batchNo?: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    expiryDate?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface StockOutFlatRecord {
  _id?: string;
  stockOutId: string;
  date: string;
  invoiceNo: string;
  itemName: string;
  quantity: number;
  unit: string;
  store: string;
  manager: string;
  remarks: string;
  expiryDate: string | null;
}

interface StockOutFullInvoice {
  _id: string;
  date: string;
  invoiceNo: string;
  manager: string;
  items: Array<{
    item: Item;
    batchNo?: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    expiryDate?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface StockSummary {
  itemId: string;
  itemName: string;
  unit: string;
  totalIn: number;
  totalOut: number;
  available: number;
  minimumLevel: number;
  status: string;
}

export default function Store() {
  const [items, setItems] = useState<Item[]>([]);
  const [stockInRecords, setStockInRecords] = useState<StockInFlatRecord[]>([]);
  const [stockOutRecords, setStockOutRecords] = useState<StockOutFlatRecord[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedStockInInvoice, setSelectedStockInInvoice] = useState<StockInFullInvoice | null>(null);
  const [selectedStockOutInvoice, setSelectedStockOutInvoice] = useState<StockOutFullInvoice | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Stock IN state
  const [inItems, setInItems] = useState<StockInItem[]>([]);
  const [inDate, setInDate] = useState(new Date().toISOString().split("T")[0]);
  const [inSource, setInSource] = useState("Production");
  const [showStockInForm, setShowStockInForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stock OUT state
  const [outItems, setOutItems] = useState<any[]>([]);
  const [outDate, setOutDate] = useState(new Date().toISOString().split("T")[0]);
  const [showStockOutForm, setShowStockOutForm] = useState(false);
  const [isSubmittingOut, setIsSubmittingOut] = useState(false);

  const loadData = async () => {
    try {
      const [itemsData, stockInData, stockOutData] = await Promise.all([
        apiRequest("/items"),
        apiRequest("/stock-in"),
        apiRequest("/stock-out"),
      ]);
      setItems(itemsData || []);
      setStockInRecords(stockInData || []);
      setStockOutRecords(stockOutData || []);
    } catch (error) {
      console.error("Error loading store data:", error);
    }
  };

  const loadStockSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const response = await apiRequest("/dashboard/stock-summary");
      setStockSummary(response.data || []);
    } catch (error) {
      console.error("Error loading stock summary:", error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    loadData();
    loadStockSummary();
  }, []);

  const getItemName = (itemId: string) => {
    const item = items.find(i => i._id === itemId);
    return item?.name || "Unknown Item";
  };

  const getItemUnit = (itemId: string) => {
    const item = items.find(i => i._id === itemId);
    return item?.unit || "";
  };

  const getItemShelfLife = (itemId: string) => {
    const item = items.find(i => i._id === itemId);
    return item?.shelfLifeDays || 0;
  };

  const calculateExpiryDate = (productionDate: string, shelfLifeDays: number) => {
    if (!shelfLifeDays || shelfLifeDays === 0) return "";
    const date = new Date(productionDate);
    date.setDate(date.getDate() + shelfLifeDays);
    return date.toISOString().split('T')[0];
  };

  // ==================== STOCK IN METHODS ====================
  const addInItem = () => {
    setInItems([
      ...inItems,
      {
        id: Date.now(),
        item: "",
        batchNo: "",
        quantity: 0,
        unitCost: 0,
        expiryDate: "",
      },
    ]);
  };

  const updateInItem = (id: number, field: string, value: any) => {
    setInItems(
      inItems.map((item) => {
        const updatedItem = { ...item, [field]: value };
        
        if (field === "item" && inSource === "Production" && value) {
          const shelfLifeDays = getItemShelfLife(value);
          updatedItem.expiryDate = calculateExpiryDate(inDate, shelfLifeDays);
        }
        
        if (field === "item" && inSource === "Purchase" && value) {
          const shelfLifeDays = getItemShelfLife(value);
          if (shelfLifeDays && shelfLifeDays > 0) {
            updatedItem.expiryDate = calculateExpiryDate(inDate, shelfLifeDays);
          }
        }
        
        return updatedItem;
      })
    );
  };

  useEffect(() => {
    if (inItems.length > 0 && inSource === "Production") {
      setInItems(prevItems =>
        prevItems.map(item => {
          if (item.item) {
            const shelfLifeDays = getItemShelfLife(item.item);
            return {
              ...item,
              expiryDate: calculateExpiryDate(inDate, shelfLifeDays)
            };
          }
          return item;
        })
      );
    }
  }, [inDate, inSource]);

  const removeInItem = (id: number) => {
    setInItems(inItems.filter((item) => item.id !== id));
  };

  const recordStockIn = async () => {
    if (inItems.length === 0) {
      alert("Please add at least one item");
      return;
    }

    for (const item of inItems) {
      if (!item.item) {
        alert("Please select a product for all items");
        return;
      }
      if (!item.batchNo || item.batchNo.trim() === "") {
        alert(`Batch number is required for ${getItemName(item.item)}`);
        return;
      }
      if (item.quantity <= 0) {
        alert(`Quantity must be greater than 0 for ${getItemName(item.item)}`);
        return;
      }
      if (item.unitCost <= 0) {
        alert(`Unit cost is required for ${getItemName(item.item)}`);
        return;
      }
      if (!item.expiryDate) {
        alert(`Expiry date is required for ${getItemName(item.item)}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const requestBody = {
        date: inDate,
        source: inSource,
        items: inItems.map(item => ({
          item: item.item,
          batchNo: item.batchNo,
          quantity: item.quantity,
          unitCost: item.unitCost,
          expiryDate: item.expiryDate,
        })),
      };

      await apiRequest("/stock-in", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      
      setInItems([]);
      setInDate(new Date().toISOString().split("T")[0]);
      setInSource("Production");
      setShowStockInForm(false);
      loadData();
      loadStockSummary();
      alert("Stock IN recorded successfully!");
    } catch (error: any) {
      console.error("Error recording Stock IN:", error);
      alert(error.message || "Error recording Stock IN");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalInCost = () =>
    inItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitCost || 0), 0);

  const finishedGoods = items.filter(item => item.category === "Finished Good" && item.status === "Active");

  const viewStockInDetails = async (stockInId: string) => {
    setIsLoadingInvoice(true);
    try {
      const fullInvoice = await apiRequest(`/stock-in/${stockInId}`);
      setSelectedStockInInvoice(fullInvoice);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      alert("Error loading invoice details");
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  const groupedStockInRecords = stockInRecords.reduce((groups: any, record) => {
    if (!groups[record.stockInId]) {
      groups[record.stockInId] = {
        _id: record.stockInId,
        date: record.date,
        invoiceNo: record.invoiceNo,
        source: record.store,
        manager: record.manager,
        totalItems: 0,
        totalCost: 0,
      };
    }
    groups[record.stockInId].totalItems += 1;
    groups[record.stockInId].totalCost += record.totalCost || 0;
    return groups;
  }, {});

  const groupedStockInList = Object.values(groupedStockInRecords);

  // ==================== STOCK OUT METHODS ====================
  const addOutItem = () => {
    setOutItems([
      ...outItems,
      {
        id: Date.now(),
        item: "",
        quantity: 0,
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
    if (outItems.length === 0) {
      alert("Please add at least one item");
      return;
    }

    for (const item of outItems) {
      if (!item.item) {
        alert("Please select a product for all items");
        return;
      }
      if (item.quantity <= 0) {
        alert(`Quantity must be greater than 0 for ${getItemName(item.item)}`);
        return;
      }
    }

    setIsSubmittingOut(true);

    try {
      const requestBody = {
        date: outDate,
        items: outItems.map(item => ({
          item: item.item,
          quantity: item.quantity,
        })),
      };

      await apiRequest("/stock-out", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      
      setOutItems([]);
      setOutDate(new Date().toISOString().split("T")[0]);
      setShowStockOutForm(false);
      loadData();
      loadStockSummary();
      alert("Stock OUT recorded successfully!");
    } catch (error: any) {
      console.error("Error recording Stock OUT:", error);
      alert(error.message || "Error recording Stock OUT");
    } finally {
      setIsSubmittingOut(false);
    }
  };

  const viewStockOutDetails = async (stockOutId: string) => {
    setIsLoadingInvoice(true);
    try {
      const fullInvoice = await apiRequest(`/stock-out/${stockOutId}`);
      setSelectedStockOutInvoice(fullInvoice);
    } catch (error) {
      console.error("Error fetching stock out details:", error);
      alert("Error loading stock out details");
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  const groupedStockOutRecords = stockOutRecords.reduce((groups: any, record) => {
    if (!groups[record.stockOutId]) {
      groups[record.stockOutId] = {
        _id: record.stockOutId,
        date: record.date,
        invoiceNo: record.invoiceNo,
        manager: record.manager,
        totalItems: 0,
      };
    }
    groups[record.stockOutId].totalItems += 1;
    return groups;
  }, {});

  const groupedStockOutList = Object.values(groupedStockOutRecords);

  const activeItems = items.filter(item => item.status === "Active");

  // Stats for dashboard
  const totalItems = stockSummary.length;
  const lowStockItems = stockSummary.filter(item => item.status === "Low Stock").length;
  const outOfStockItems = stockSummary.filter(item => item.status === "Out of Stock").length;
  const inStockItems = stockSummary.filter(item => item.status === "In Stock").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Management</h1>
        <p className="text-gray-600">Manage inventory, track stock movements, and monitor stock levels</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`pb-3 px-4 font-medium transition whitespace-nowrap ${
            activeTab === "dashboard"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <LayoutDashboard size={20} className="inline mr-2" /> Dashboard
        </button>
        <button
          onClick={() => setActiveTab("stockin")}
          className={`pb-3 px-4 font-medium transition whitespace-nowrap ${
            activeTab === "stockin"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Package size={20} className="inline mr-2" /> Stock IN
        </button>
        <button
          onClick={() => setActiveTab("stockout")}
          className={`pb-3 px-4 font-medium transition whitespace-nowrap ${
            activeTab === "stockout"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <TrendingDown size={20} className="inline mr-2" /> Stock OUT
        </button>
      </div>

      {/* ==================== DASHBOARD TAB ==================== */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Items</p>
                  <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Package size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Stock</p>
                  <p className="text-3xl font-bold text-green-600">{inStockItems}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                  <p className="text-3xl font-bold text-yellow-600">{lowStockItems}</p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <AlertCircle size={24} className="text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
                  <p className="text-3xl font-bold text-red-600">{outOfStockItems}</p>
                </div>
                <div className="bg-red-100 rounded-full p-3">
                  <TrendingDown size={24} className="text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Stock Summary Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Stock Summary</h3>
              <button 
                onClick={loadStockSummary} 
                disabled={isLoadingSummary}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {isLoadingSummary ? "Loading..." : "Refresh"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Item Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total IN</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total OUT</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Available</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Min Level</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockSummary.length > 0 ? (
                    stockSummary.map((item) => (
                      <tr key={item.itemId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.itemName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.unit}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.totalIn}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.totalOut}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.available}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.minimumLevel}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                            item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.status === 'In Stock' && <CheckCircle size={12} />}
                            {item.status === 'Low Stock' && <AlertCircle size={12} />}
                            {item.status === 'Out of Stock' && <TrendingDown size={12} />}
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <Package size={48} className="mx-auto text-gray-300 mb-2" />
                        No stock data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== STOCK IN TAB ==================== */}
      {activeTab === "stockin" && (
        <div className="space-y-6">
          {!showStockInForm && (
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Stock IN Records</h2>
              <button
                onClick={() => setShowStockInForm(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                <Plus size={20} />
                New Stock IN
              </button>
            </div>
          )}

          {showStockInForm && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">New Stock IN</h2>
                <button
                  onClick={() => {
                    setShowStockInForm(false);
                    setInItems([]);
                    setInDate(new Date().toISOString().split("T")[0]);
                    setInSource("Production");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                {inSource === "Production" ? (
                  <>
                    <p className="text-sm text-blue-700 font-semibold mb-2">📌 Production Mode - Manual Entry Required:</p>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                      <li><strong>Batch Number</strong> - Enter manually</li>
                      <li><strong>Quantity</strong> - Enter the produced quantity</li>
                      <li><strong>Unit Cost</strong> - Enter the production cost per unit</li>
                      <li><strong>Expiry Date</strong> - Auto-calculated from Production Date + Product shelf life</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-blue-700 font-semibold mb-2">🛒 Purchase Mode - Manual Entry:</p>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                      <li><strong>Batch Number</strong> - Optional manual entry</li>
                      <li><strong>Quantity</strong> - Enter the purchased quantity</li>
                      <li><strong>Unit Cost</strong> - Enter the purchase cost per unit</li>
                      <li><strong>Expiry Date</strong> - Auto-suggested based on shelf life (editable)</li>
                    </ul>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {inSource === "Production" ? "Production Date *" : "Date *"}
                  </label>
                  <input
                    type="date"
                    value={inDate}
                    onChange={(e) => setInDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source *</label>
                  <select
                    value={inSource}
                    onChange={(e) => {
                      setInSource(e.target.value);
                      setInItems([]);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="Production">🏭 Production</option>
                    <option value="Purchase">🛒 Purchase</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {inItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <Package size={48} className="mx-auto text-gray-300 mb-2" />
                    <p>No items added yet</p>
                    <p className="text-sm">Click "Add Product" to start</p>
                  </div>
                ) : (
                  inItems.map((item, index) => {
                    const selectedItem = items.find(i => i._id === item.item);
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-800">Item {index + 1}</h4>
                          <button onClick={() => removeInItem(item.id)} className="text-red-600 hover:text-red-800 p-1">
                            <X size={20} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product (Finished Good) *</label>
                            <select
                              value={item.item}
                              onChange={(e) => updateInItem(item.id, "item", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select a product...</option>
                              {finishedGoods.map((i) => (
                                <option key={i._id} value={i._id}>
                                  {i.name} ({i.unit}) - Shelf Life: {i.shelfLifeDays} days
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number *</label>
                            <input
                              type="text"
                              placeholder="Enter batch number"
                              value={item.batchNo}
                              onChange={(e) => updateInItem(item.id, "batchNo", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                            <input
                              type="number"
                              placeholder="Enter quantity"
                              value={item.quantity}
                              onChange={(e) => updateInItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost (LKR) *</label>
                            <input
                              type="number"
                              placeholder="Enter unit cost"
                              step="0.01"
                              value={item.unitCost}
                              onChange={(e) => updateInItem(item.id, "unitCost", parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date {inSource === "Production" ? "*" : "(Optional)"}</label>
                            <input
                              type="date"
                              value={item.expiryDate}
                              onChange={(e) => updateInItem(item.id, "expiryDate", e.target.value)}
                              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 ${
                                inSource === "Production" && item.item ? "bg-gray-100" : ""
                              }`}
                              readOnly={inSource === "Production" && !!item.item}
                            />
                            {inSource === "Production" && selectedItem && (
                              <p className="text-xs text-gray-500 mt-1">
                                Auto-calculated: {inDate} + {selectedItem.shelfLifeDays} days
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <button onClick={addInItem} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-0 py-2 font-medium mb-6 transition">
                <Plus size={18} /> Add Product
              </button>

              {inItems.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-700"><strong>Total Cost:</strong> LKR {getTotalInCost().toLocaleString()}</p>
                    <p className="text-xs text-blue-600 mt-2">Total Items: {inItems.length} | Total Quantity: {inItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
                  </div>
                </div>
              )}

              <button
                onClick={recordStockIn}
                disabled={inItems.length === 0 || isSubmitting}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                  inItems.length === 0 || isSubmitting
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <Package size={20} />
                {isSubmitting ? "Recording..." : "Record Stock IN"}
              </button>
            </div>
          )}

          {!showStockInForm && (
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Stock IN Records</h3>
                <button onClick={loadData} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Refresh</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Source</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Manager</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {groupedStockInList.length > 0 ? (
                      groupedStockInList.map((record: any) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.invoiceNo}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              record.source === 'Production' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {record.source === 'Production' ? <Factory size={12} /> : <ShoppingCart size={12} />}
                              {record.source}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{record.totalItems}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">LKR {record.totalCost?.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{record.manager}</td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => viewStockInDetails(record._id)}
                              disabled={isLoadingInvoice}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          <Package size={48} className="mx-auto text-gray-300 mb-2" />
                          No Stock IN records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== STOCK OUT TAB ==================== */}
      {activeTab === "stockout" && (
        <div className="space-y-6">
          {!showStockOutForm && (
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Stock OUT Records</h2>
              <button
                onClick={() => setShowStockOutForm(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                <Plus size={20} />
                New Stock OUT
              </button>
            </div>
          )}

          {showStockOutForm && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">New Stock OUT - Dispatch Items</h2>
                <button
                  onClick={() => {
                    setShowStockOutForm(false);
                    setOutItems([]);
                    setOutDate(new Date().toISOString().split("T")[0]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700 font-semibold mb-2">📌 Stock OUT Logic:</p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li><strong>Finished Goods</strong> - Deducted from batches (FIFO - First In First Out)</li>
                  <li><strong>Raw Materials</strong> - Deducted from total quantity (no batch tracking)</li>
                  <li><strong>Invoice Number</strong> - Auto-generated by backend (ST-OUT-XXX)</li>
                  <li><strong>Manager Name</strong> - Auto-filled from logged-in user</li>
                </ul>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={outDate}
                  onChange={(e) => setOutDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-4 mb-6">
                {outItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <TrendingDown size={48} className="mx-auto text-gray-300 mb-2" />
                    <p>No items added yet</p>
                    <p className="text-sm">Click "Add Product" to start</p>
                  </div>
                ) : (
                  outItems.map((item, index) => {
                    const selectedItem = items.find(i => i._id === item.item);
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-800">Item {index + 1}</h4>
                          <button onClick={() => removeOutItem(item.id)} className="text-red-600 hover:text-red-800 p-1">
                            <X size={20} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
                            <select
                              value={item.item}
                              onChange={(e) => updateOutItem(item.id, "item", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select a product...</option>
                              {activeItems.map((i) => (
                                <option key={i._id} value={i._id}>
                                  {i.name} ({i.unit}) - {i.category}
                                </option>
                              ))}
                            </select>
                            {selectedItem && (
                              <p className="text-xs text-gray-500 mt-1">
                                {selectedItem.category === "Finished Good" 
                                  ? "Will be deducted from batches (FIFO)" 
                                  : "Will be deducted from total stock"}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                            <input
                              type="number"
                              placeholder="Enter quantity"
                              value={item.quantity}
                              onChange={(e) => updateOutItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <button onClick={addOutItem} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-0 py-2 font-medium mb-6 transition">
                <Plus size={18} /> Add Product
              </button>

              <button
                onClick={recordStockOut}
                disabled={outItems.length === 0 || isSubmittingOut}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                  outItems.length === 0 || isSubmittingOut
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <TrendingDown size={20} />
                {isSubmittingOut ? "Recording..." : "Record Stock OUT"}
              </button>
            </div>
          )}

          {!showStockOutForm && (
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Stock OUT Records</h3>
                <button onClick={loadData} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Refresh</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Manager</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {groupedStockOutList.length > 0 ? (
                      groupedStockOutList.map((record: any) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.invoiceNo}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{record.totalItems}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{record.manager}</td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => viewStockOutDetails(record._id)}
                              disabled={isLoadingInvoice}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <TrendingDown size={48} className="mx-auto text-gray-300 mb-2" />
                          No Stock OUT records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stock IN Invoice Modal */}
      {selectedStockInInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Stock IN Invoice Details</h3>
              <button onClick={() => setSelectedStockInInvoice(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm">
              <div><p className="text-gray-600">Invoice No:</p><p className="font-semibold text-gray-900">{selectedStockInInvoice.invoiceNo}</p></div>
              <div><p className="text-gray-600">Date:</p><p className="font-semibold text-gray-900">{new Date(selectedStockInInvoice.date).toLocaleDateString()}</p></div>
              <div><p className="text-gray-600">Source:</p><p className="font-semibold text-gray-900">{selectedStockInInvoice.source}</p></div>
              <div><p className="text-gray-600">Manager:</p><p className="font-semibold text-gray-900">{selectedStockInInvoice.manager}</p></div>
              <div><p className="text-gray-600">Total Cost:</p><p className="font-semibold text-gray-900">LKR {selectedStockInInvoice.items?.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}</p></div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600">#</th>
                      <th className="px-4 py-2 text-left text-gray-600">Product Name</th>
                      <th className="px-4 py-2 text-left text-gray-600">Unit</th>
                      <th className="px-4 py-2 text-left text-gray-600">Batch No</th>
                      <th className="px-4 py-2 text-left text-gray-600">Unit Cost</th>
                      <th className="px-4 py-2 text-left text-gray-600">Quantity</th>
                      <th className="px-4 py-2 text-left text-gray-600">Expiry Date</th>
                      <th className="px-4 py-2 text-left text-gray-600">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStockInInvoice.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td className="px-4 py-2 font-medium">{item.item?.name || "Unknown Item"}</td>
                        <td className="px-4 py-2 text-gray-600">{item.item?.unit || ""}</td>
                        <td className="px-4 py-2 font-mono text-xs">{item.batchNo || "--"}</td>
                        <td className="px-4 py-2">LKR {item.unitCost?.toLocaleString() || 0}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "--"}</td>
                        <td className="px-4 py-2 font-semibold">LKR {item.totalCost?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr className="border-t border-gray-200">
                      <td colSpan={7} className="px-4 py-2 text-right font-semibold">Grand Total:</td>
                      <td className="px-4 py-2 font-bold text-blue-600">
                        LKR {selectedStockInInvoice.items?.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-xs text-gray-500">Created: {new Date(selectedStockInInvoice.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stock OUT Invoice Modal */}
      {selectedStockOutInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Stock OUT Invoice Details</h3>
              <button onClick={() => setSelectedStockOutInvoice(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm">
              <div><p className="text-gray-600">Invoice No:</p><p className="font-semibold text-gray-900">{selectedStockOutInvoice.invoiceNo}</p></div>
              <div><p className="text-gray-600">Date:</p><p className="font-semibold text-gray-900">{new Date(selectedStockOutInvoice.date).toLocaleDateString()}</p></div>
              <div><p className="text-gray-600">Manager:</p><p className="font-semibold text-gray-900">{selectedStockOutInvoice.manager}</p></div>
              <div><p className="text-gray-600">Total Items:</p><p className="font-semibold text-gray-900">{selectedStockOutInvoice.items?.length || 0}</p></div>
              <div><p className="text-gray-600">Total Quantity:</p><p className="font-semibold text-gray-900">{selectedStockOutInvoice.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</p></div>
              <div><p className="text-gray-600">Total Value:</p><p className="font-semibold text-gray-900">LKR {selectedStockOutInvoice.items?.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString() || 0}</p></div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600">#</th>
                      <th className="px-4 py-2 text-left text-gray-600">Product Name</th>
                      <th className="px-4 py-2 text-left text-gray-600">Unit</th>
                      <th className="px-4 py-2 text-left text-gray-600">Batch No</th>
                      <th className="px-4 py-2 text-left text-gray-600">Unit Cost</th>
                      <th className="px-4 py-2 text-left text-gray-600">Quantity</th>
                      <th className="px-4 py-2 text-left text-gray-600">Expiry Date</th>
                      <th className="px-4 py-2 text-left text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStockOutInvoice.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td className="px-4 py-2 font-medium">{item.item?.name || "Unknown Item"}</td>
                        <td className="px-4 py-2 text-gray-600">{item.item?.unit || ""}</td>
                        <td className="px-4 py-2 font-mono text-xs">{item.batchNo || "--"}</td>
                        <td className="px-4 py-2">LKR {item.unitCost?.toLocaleString() || 0}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "--"}</td>
                        <td className="px-4 py-2 font-semibold">LKR {item.totalCost?.toLocaleString() || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr className="border-t border-gray-200">
                      <td colSpan={7} className="px-4 py-2 text-right font-semibold">Grand Total:</td>
                      <td className="px-4 py-2 font-bold text-blue-600">
                        LKR {selectedStockOutInvoice.items?.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString() || 0}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-xs text-gray-500">Created: {new Date(selectedStockOutInvoice.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}