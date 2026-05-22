import { useEffect, useState } from 'react';
import { X, Plus, CheckCircle, Trash2, Printer, Eye, RefreshCw, Download, Filter } from 'lucide-react';
import { apiRequest } from '../api/api';
import { formatCurrency } from '../utils/formatCurrency';
import { Clock, DollarSign, FileText } from 'lucide-react';

interface Customer {
  _id: string;
  customerId: string;
  customerName: string;
  shopName: string;
  phoneNumber: string;
  route: string;
  creditLimit: number;
  balance: number;
  displayName?: string;
}

interface Product {
  _id: string;
  name: string;
  unit: string;
  sellingPrice: number;
  category: string;
}

interface LineItem {
  item: string;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
}

interface SalesInvoice {
  _id: string;
  invoiceId: string;
  invoiceDate: string;
  customer: Customer;
  route: any;
  salesman: any;
  items: LineItem[];
  subTotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
  status: string;
  notes?: string;
  createdAt: string;
}

interface SalesSummary {
  totalSales: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
}

export default function SalesEntry() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SalesInvoice[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [newItem, setNewItem] = useState({
    item: '',
    quantity: 1,
  });

  // Load initial data
  useEffect(() => {
    loadCustomers();
    loadProducts();
    loadSales();
  }, []);

  // Clear messages after 5 seconds
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

  const loadCustomers = async () => {
    try {
      const data = await apiRequest('/customers/popup/list');
      const formattedCustomers = (data || []).map((cust: any) => ({
        ...cust,
        displayName: cust.displayName || `${cust.customerName} - ${cust.shopName}`
      }));
      setCustomers(formattedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await apiRequest('/items/finished-goods/billing');
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const loadSales = async () => {
    setIsLoading(true);
    try {
      let url = '/sales';
      if (startDate && endDate) {
        url = `/sales?startDate=${startDate}&endDate=${endDate}`;
      }
      const data = await apiRequest(url);
      setSales(data.sales || data || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (error: any) {
      console.error('Error loading sales:', error);
      setError(error.message || 'Failed to load sales');
      setSales([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.item) {
      setError('Please select a product');
      return;
    }
    if (newItem.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    const product = products.find(p => p._id === newItem.item);
    if (!product) {
      setError('Product not found');
      return;
    }

    const existingItemIndex = lineItems.findIndex(item => item.item === newItem.item);
    if (existingItemIndex !== -1) {
      const updatedItems = [...lineItems];
      updatedItems[existingItemIndex].quantity += newItem.quantity;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
      setLineItems(updatedItems);
    } else {
      const newLineItem: LineItem = {
        item: product._id,
        itemName: product.name,
        quantity: newItem.quantity,
        price: product.sellingPrice,
        total: newItem.quantity * product.sellingPrice,
      };
      setLineItems([...lineItems, newLineItem]);
    }

    setNewItem({ item: '', quantity: 1 });
  };

  const handleRemoveItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(index);
      return;
    }
    const updatedItems = [...lineItems];
    updatedItems[index].quantity = quantity;
    updatedItems[index].total = quantity * updatedItems[index].price;
    setLineItems(updatedItems);
  };

  const subTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = subTotal - discount;

  const handleCreateInvoice = async () => {
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }
    if (lineItems.length === 0) {
      setError('Please add at least one item');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        customer: selectedCustomer,
        items: lineItems.map(item => ({
          item: item.item,
          quantity: item.quantity,
        })),
        discount: discount,
        notes: notes || undefined,
      };

      const response = await apiRequest('/sales', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      setSuccessMessage(`Invoice ${response.sale?.invoiceId || 'created'} created successfully!`);
      
      setSelectedCustomer('');
      setLineItems([]);
      setDiscount(0);
      setNotes('');
      setNewItem({ item: '', quantity: 1 });
      
      await loadSales();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      setError(error.message || 'Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const viewInvoice = async (id: string) => {
    setIsLoading(true);
    try {
      const invoice = await apiRequest(`/sales/${id}`);
      setSelectedInvoice(invoice.sale || invoice);
    } catch (error: any) {
      console.error('Error loading invoice:', error);
      setError(error.message || 'Failed to load invoice details');
    } finally {
      setIsLoading(false);
    }
  };

  const closeInvoiceModal = () => {
    setSelectedInvoice(null);
  };

  const applyFilters = () => {
    loadSales();
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setTimeout(() => loadSales(), 100);
  };

  const handleExportCSV = () => {
    const headers = ['Invoice ID', 'Date', 'Customer', 'Items', 'Total Amount', 'Paid Amount', 'Due Amount', 'Status', 'Notes'];
    const rows = sales.map(s => [
      s.invoiceId || '',
      s.invoiceDate ? new Date(s.invoiceDate).toLocaleDateString() : '',
      s.customer?.customerName || 'Unknown',
      s.items?.length || 0,
      s.totalAmount || 0,
      s.paidAmount || 0,
      s.dueAmount || 0,
      s.status || '',
      s.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setSuccessMessage('Report exported successfully!');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setError('Please allow pop-ups to print');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sales Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1e40af; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; }
          .summary { margin-top: 20px; padding: 10px; background-color: #f3f4f6; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Sales Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        ${startDate && endDate ? `<p>Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>` : ''}
        
        ${summary ? `
          <div class="summary">
            <h3>Summary</h3>
            <p>Total Sales: ${summary.totalSales || 0}</p>
            <p>Total Amount: LKR ${(summary.totalAmount || 0).toLocaleString()}</p>
            <p>Total Paid: LKR ${(summary.totalPaid || 0).toLocaleString()}</p>
            <p>Total Due: LKR ${(summary.totalDue || 0).toLocaleString()}</p>
          </div>
        ` : ''}
        
        <table>
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total (LKR)</th>
              <th>Paid (LKR)</th>
              <th>Due (LKR)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${sales.map(s => `
              <tr>
                <td>${s.invoiceId || ''}</td>
                <td>${s.invoiceDate ? new Date(s.invoiceDate).toLocaleDateString() : ''}</td>
                <td>${s.customer?.customerName || 'Unknown'}</td>
                <td>${s.items?.length || 0}</td>
                <td>${(s.totalAmount || 0).toLocaleString()}</td>
                <td>${(s.paidAmount || 0).toLocaleString()}</td>
                <td>${(s.dueAmount || 0).toLocaleString()}</td>
                <td>${s.status || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const getCustomerBalance = () => {
    const customer = customers.find(c => c._id === selectedCustomer);
    return customer?.balance || 0;
  };

  const getCustomerCreditLimit = () => {
    const customer = customers.find(c => c._id === selectedCustomer);
    return customer?.creditLimit || 0;
  };

  const safeFormatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'LKR 0';
    }
    return formatCurrency(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Entry</h1>
        <p className="text-gray-600">Create sales invoices and manage customer purchases</p>
      </div>

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} />
            <span className="text-sm">{successMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2">
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Total Sales</p>
                <p className="text-3xl font-bold mt-2">{summary.totalSales || 0}</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <FileText size={24} />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Total Amount</p>
                <p className="text-3xl font-bold mt-2">{safeFormatCurrency(summary.totalAmount)}</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <DollarSign size={24} />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Total Paid</p>
                <p className="text-3xl font-bold mt-2">{safeFormatCurrency(summary.totalPaid)}</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Total Due</p>
                <p className="text-3xl font-bold mt-2">{safeFormatCurrency(summary.totalDue)}</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <Clock size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition">
              <Printer size={16} /> Print
            </button>
            <button onClick={loadSales} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">Apply Filters</button>
              <button onClick={resetFilters} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition">Reset</button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">📄</span>
          <h2 className="text-lg font-bold text-gray-800">Create Sales Invoice</h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">SELECT CUSTOMER *</label>
          <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
            <option value="">Select a customer...</option>
            {customers.map((cust) => (
              <option key={cust._id} value={cust._id}>{cust.displayName || `${cust.customerName} - ${cust.shopName}`}</option>
            ))}
          </select>
          {selectedCustomer && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Customer Balance:</span>{' '}
              <span className={getCustomerBalance() > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                {safeFormatCurrency(getCustomerBalance())}
              </span>
              <span className="ml-4">Credit Limit: {safeFormatCurrency(getCustomerCreditLimit())}</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">LINE ITEMS</label>
          
          <div className="space-y-3 mb-4">
            {lineItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <Plus size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm">No items added yet</p>
                <p className="text-xs">Use the form below to add products</p>
              </div>
            ) : (
              lineItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-lg">
                  <div className="col-span-5"><div className="text-sm font-medium text-gray-800">{item.itemName}</div></div>
                  <div className="col-span-2"><input type="number" min="1" value={item.quantity} onChange={(e) => updateItemQuantity(idx, parseInt(e.target.value) || 0)} className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm" /></div>
                  <div className="col-span-2"><div className="text-sm text-gray-600">{safeFormatCurrency(item.price)}</div></div>
                  <div className="col-span-2"><div className="text-sm font-semibold text-gray-800">{safeFormatCurrency(item.total)}</div></div>
                  <div className="col-span-1 text-right"><button onClick={() => handleRemoveItem(idx)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button></div>
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-6">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">PRODUCT</label>
              <select value={newItem.item} onChange={(e) => setNewItem({ ...newItem, item: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                <option value="">Select a product...</option>
                {products.map((prod) => (<option key={prod._id} value={prod._id}>{prod.name} ({prod.unit}) - {safeFormatCurrency(prod.sellingPrice)}</option>))}
              </select>
            </div>
            <div className="col-span-3">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">QUANTITY</label>
              <input type="number" min="1" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div className="col-span-3">
              <button onClick={handleAddItem} disabled={!newItem.item} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center gap-1 disabled:opacity-50"><Plus size={16} /> Add Item</button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">DISCOUNT (LKR)</label><input type="number" min="0" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" /></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">SUB TOTAL</label><div className="px-3 py-2 bg-white rounded border border-gray-300 text-sm font-semibold text-gray-800">{safeFormatCurrency(subTotal)}</div></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">TOTAL AMOUNT</label><div className="px-3 py-2 bg-blue-50 rounded border border-blue-300 text-sm font-bold text-blue-700">{safeFormatCurrency(totalAmount)}</div></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">NOTES</label><input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery confirmed" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" /></div>
          </div>
        </div>

        {selectedCustomer && getCustomerBalance() + totalAmount > getCustomerCreditLimit() && getCustomerCreditLimit() > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">⚠️ Warning: This invoice will exceed the customer's credit limit!</p>
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={handleCreateInvoice} disabled={isLoading || !selectedCustomer || lineItems.length === 0} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Creating...' : <><CheckCircle size={18} /> Create Invoice</>}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><span className="text-xl">📋</span><h2 className="text-lg font-bold text-gray-800">Sales Invoices</h2></div>
          <button onClick={loadSales} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Refresh</button>
        </div>

        {isLoading && sales.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : sales.length === 0 ? (
          <div className="text-center py-8 text-gray-500"><FileText size={48} className="mx-auto text-gray-300 mb-2" /><p>No invoices created yet</p><p className="text-sm mt-1">Click "Create Invoice" to get started</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Due</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sales.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.invoiceId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{invoice.customer?.customerName || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{invoice.items?.length || 0}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{safeFormatCurrency(invoice.totalAmount)}</td>
                    <td className="px-6 py-4 text-sm text-green-600">{safeFormatCurrency(invoice.paidAmount || 0)}</td>
                    <td className="px-6 py-4 text-sm text-red-600">{safeFormatCurrency(invoice.dueAmount || invoice.totalAmount)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${invoice.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : invoice.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {invoice.paymentStatus || 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button onClick={() => viewInvoice(invoice._id)} className="text-blue-600 hover:text-blue-800 p-1" title="View Invoice"><Eye size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-lg font-semibold text-gray-800">Invoice Details</h3><p className="text-sm text-gray-600">{selectedInvoice.invoiceId}</p></div>
              <button onClick={closeInvoiceModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 pb-4 border-b border-gray-200">
              <div><p className="text-xs text-gray-500">Invoice Date</p><p className="text-sm font-medium">{selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString() : 'N/A'}</p></div>
              <div><p className="text-xs text-gray-500">Customer</p><p className="text-sm font-medium">{selectedInvoice.customer?.customerName || 'N/A'}</p><p className="text-xs text-gray-500">{selectedInvoice.customer?.shopName || ''}</p></div>
              <div><p className="text-xs text-gray-500">Salesman</p><p className="text-sm font-medium">{selectedInvoice.salesman?.username || 'N/A'}</p></div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div><p className="text-xs text-gray-500">Total Amount</p><p className="text-lg font-bold text-gray-900">{safeFormatCurrency(selectedInvoice.totalAmount)}</p></div>
              <div><p className="text-xs text-gray-500">Paid Amount</p><p className="text-lg font-bold text-green-600">{safeFormatCurrency(selectedInvoice.paidAmount || 0)}</p></div>
              <div><p className="text-xs text-gray-500">Due Amount</p><p className="text-lg font-bold text-red-600">{safeFormatCurrency(selectedInvoice.dueAmount || selectedInvoice.totalAmount)}</p></div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600">Product</th>
                      <th className="px-4 py-2 text-left text-gray-600">Quantity</th>
                      <th className="px-4 py-2 text-left text-gray-600">Price</th>
                      <th className="px-4 py-2 text-left text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedInvoice.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">{item.itemName}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{safeFormatCurrency(item.price)}</td>
                        <td className="px-4 py-2 font-medium">{safeFormatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr><td colSpan={3} className="px-4 py-2 text-right font-semibold">Sub Total:</td><td className="px-4 py-2">{safeFormatCurrency(selectedInvoice.subTotal)}</td></tr>
                    {selectedInvoice.discount > 0 && (<tr><td colSpan={3} className="px-4 py-2 text-right font-semibold">Discount:</td><td className="px-4 py-2 text-red-600">- {safeFormatCurrency(selectedInvoice.discount)}</td></tr>)}
                    <tr className="border-t border-gray-200"><td colSpan={3} className="px-4 py-2 text-right font-bold">Total Amount:</td><td className="px-4 py-2 font-bold text-blue-600">{safeFormatCurrency(selectedInvoice.totalAmount)}</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {selectedInvoice.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Notes</p><p className="text-sm text-gray-700">{selectedInvoice.notes}</p></div>
            )}

            <div className="mt-6 flex justify-end">
              <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"><Printer size={16} /> Print Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}