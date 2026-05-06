import { useState } from 'react';
import { X, Plus, CheckCircle } from 'lucide-react';
import useSalesStore from '../stores/useSalesStore';
import useCustomerStore from '../stores/useCustomerStore';
import useProductStore from '../stores/useProductStore';
import { formatCurrency } from '../utils/formatCurrency';

interface LineItem {
  product: string;
  quantity: number;
  price: number;
  total: number;
}

export default function SalesEntry() {
  const { sales, addSale } = useSalesStore();
  const { customers } = useCustomerStore();
  const { products } = useProductStore();

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [newItem, setNewItem] = useState({ product: '', quantity: 1, price: 0 });

  const subTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = subTotal - discount;

  const handleAddItem = () => {
    if (newItem.product && newItem.quantity > 0 && newItem.price > 0) {
      const item: LineItem = {
        product: newItem.product,
        quantity: newItem.quantity,
        price: newItem.price,
        total: newItem.quantity * newItem.price,
      };
      setLineItems([...lineItems, item]);
      setNewItem({ product: '', quantity: 1, price: 0 });
    }
  };

  const handleRemoveItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleCreateInvoice = () => {
    if (!selectedCustomer || lineItems.length === 0) {
      alert('Please select a customer and add items');
      return;
    }

    const sale = {
      id: `INV-${String(sales.length + 38).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      customer: selectedCustomer,
      items: lineItems.length,
      subTotal,
      discount,
      total: totalAmount,
      paid: 0,
      due: totalAmount,
      status: 'Unpaid',
      notes,
    };

    addSale(sale as any);
    alert('Invoice created successfully!');
    
    // Reset form
    setSelectedCustomer('');
    setLineItems([]);
    setDiscount(0);
    setNotes('');
  };

  // Recent invoices data
  const recentInvoices = sales.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Create Sales Invoice Section */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">📄</span>
          <h2 className="text-lg font-bold text-gray-800">Create Sales Invoice</h2>
        </div>

        {/* Customer Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">SELECT CUSTOMER *</label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a customer...</option>
            {customers.map((cust: any) => (
              <option key={cust.id} value={cust.name}>
                {cust.shopName} - {cust.name}
              </option>
            ))}
          </select>
        </div>

        {/* Line Items */}
        <div className="mb-6 space-y-4">
          {lineItems.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 items-start pb-4 border-b border-gray-200">
              <div className="col-span-4">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">PRODUCT</label>
                <div className="px-3 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700">
                  {item.product}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">QUANTITY</label>
                <div className="px-3 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700">
                  {item.quantity}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">PRICE</label>
                <div className="px-3 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700">
                  {item.price}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">TOTAL</label>
                <div className="px-3 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700">
                  {item.total.toLocaleString()}
                </div>
              </div>
              <div className="col-span-2 flex items-end">
                <button
                  onClick={() => handleRemoveItem(idx)}
                  className="text-red-600 hover:text-red-800 font-semibold text-sm"
                >
                  ✕ Remove
                </button>
              </div>
            </div>
          ))}

          {/* Add New Item */}
          <div className="grid grid-cols-12 gap-4 items-start pt-4">
            <div className="col-span-4">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">PRODUCT</label>
              <select
                value={newItem.product}
                onChange={(e) => setNewItem({ ...newItem, product: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="">Vanilla Yogurt Drink (Bottle) - LKR 120</option>
                {products.map((prod: any) => (
                  <option key={prod.id} value={prod.name}>
                    {prod.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">QUANTITY</label>
              <input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">PRICE</label>
              <input
                type="number"
                min="0"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">TOTAL</label>
              <div className="px-3 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700">
                {(newItem.quantity * newItem.price).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="pt-4">
            <button
              onClick={handleAddItem}
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
            >
              + Add Another Item
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">DISCOUNT (LKR)</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">SUB TOTAL</label>
              <div className="px-3 py-2 bg-white rounded border border-gray-300 text-sm font-semibold text-gray-800">
                {subTotal.toLocaleString()}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">TOTAL AMOUNT</label>
              <div className="px-3 py-2 bg-white rounded border border-gray-300 text-sm font-semibold text-gray-800">
                {totalAmount.toLocaleString()}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">NOTES</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Delivery confirmed"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-end">
          <button
            onClick={handleCreateInvoice}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <CheckCircle size={18} />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Recent Sales Invoices Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h2 className="text-lg font-bold text-gray-800">Recent Sales Invoices</h2>
          </div>
          <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Last 5
          </a>
        </div>

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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentInvoices.map((invoice: any, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{invoice.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{invoice.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{invoice.items || 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(invoice.total || 0)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(invoice.paid || 0)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(invoice.due || 0)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      invoice.status === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === 'Partial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentInvoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No invoices created yet
          </div>
        )}
      </div>
    </div>
  );
}