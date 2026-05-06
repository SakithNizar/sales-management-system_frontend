import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import useCustomerStore from '../stores/useCustomerStore';
import useSalesStore from '../stores/useSalesStore';
import useAuthStore from '../stores/useAuthStore';

interface Payment {
  id: string;
  date: string;
  customer: string;
  invoice: string;
  amount: number;
  method: string;
  collectedBy: string;
}

export default function Payments() {
  const { customers } = useCustomerStore();
  const { sales } = useSalesStore();
  const { user } = useAuthStore();

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');

  // Mock payment history
  const paymentHistory: Payment[] = [
    {
      id: 'REC-005',
      date: '2025-04-14',
      customer: 'Kamal Grocery',
      invoice: 'INV-038',
      amount: 1050,
      method: 'Cash',
      collectedBy: 'Nuwan Silva',
    },
    {
      id: 'REC-006',
      date: '2025-04-13',
      customer: 'Nimal Stores',
      invoice: 'INV-039',
      amount: 2000,
      method: 'Bank',
      collectedBy: 'Nuwan Silva',
    },
  ];

  const handleRecordPayment = () => {
    if (!selectedCustomer || !selectedInvoice || !amount) {
      alert('Please fill all required fields');
      return;
    }
    alert('Payment recorded successfully!');
    setSelectedCustomer('');
    setSelectedInvoice('');
    setAmount('');
    setNotes('');
  };

  // Get invoices for selected customer
  const customerInvoices = sales.filter((s: any) => s.customer === selectedCustomer);

  const paymentMethods = ['Cash', 'Bank', 'Cheque', 'Mobile Money'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Record Payment / Receipt Section */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">💳</span>
          <h2 className="text-lg font-bold text-gray-800">Record Payment / Receipt</h2>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Select Customer */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">SELECT CUSTOMER *</label>
            <select
              value={selectedCustomer}
              onChange={(e) => {
                setSelectedCustomer(e.target.value);
                setSelectedInvoice('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Kamal Grocery - Balance Due: 12,500</option>
              {customers.map((cust: any) => (
                <option key={cust.id} value={cust.name}>
                  {cust.shopName} - Balance Due: {cust.outstanding}
                </option>
              ))}
            </select>
          </div>

          {/* Select Invoice */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">SELECT INVOICE *</label>
            <select
              value={selectedInvoice}
              onChange={(e) => setSelectedInvoice(e.target.value)}
              disabled={!selectedCustomer}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">INV-038 - Due: 0</option>
              {customerInvoices.map((inv: any) => (
                <option key={inv.id} value={inv.id}>
                  {inv.id} - Due: {inv.due || 0}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">AMOUNT *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1200"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">PAYMENT METHOD</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Notes - full width */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-2">NOTES</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Partial payment collected"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleRecordPayment}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <CheckCircle size={18} />
            Record Payment
          </button>
        </div>
      </div>

      {/* Payment History Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">⏱️</span>
            <h2 className="text-lg font-bold text-gray-800">Payment History</h2>
          </div>
          <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Recent Receipts
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Receipt ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Collected By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.invoice}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.method}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.collectedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paymentHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No payments recorded yet
          </div>
        )}
      </div>
    </div>
  );
}
