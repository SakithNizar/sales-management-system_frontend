import { useEffect, useState } from 'react';
import { CheckCircle, Eye, Printer, RefreshCw, X, Download, Filter, Calendar, DollarSign, Users, FileText } from 'lucide-react';
import { apiRequest } from '../api/api';
import { formatCurrency } from '../utils/formatCurrency';

interface Customer {
  _id: string;
  customerId: string;
  customerName: string;
  shopName: string;
  phoneNumber: string;
  balance: number;
  displayName?: string;
}

interface SalesInvoice {
  _id: string;
  invoiceId: string;
  invoiceDate: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
  customer?: {
    _id: string;
    customerName: string;
    shopName: string;
  };
}

interface Payment {
  _id: string;
  receiptId: string;
  createdAt: string;
  customer: Customer | string;
  invoice: SalesInvoice | string;
  amount: number;
  paymentMethod: string;
  salesman: {
    _id: string;
    username: string;
    fullName?: string;
  };
  notes?: string;
}

interface PaymentSummary {
  totalPayments: number;
  totalAmount: number;
  averagePayment: number;
}

export default function Payments() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const paymentMethods = ['Cash', 'Bank', 'Online'];

  useEffect(() => {
    loadCustomers();
    loadPayments();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      loadInvoices(selectedCustomer);
    }
  }, [selectedCustomer]);

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
      const data = await apiRequest('/customers');
      const formattedCustomers = (data || []).map((cust: any) => ({
        ...cust,
        displayName: `${cust.customerName || ''} - ${cust.shopName || ''}`
      }));
      setCustomers(formattedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadInvoices = async (customerId: string) => {
    setIsLoading(true);
    try {
      const allSales = await apiRequest('/sales');
      console.log('All sales data:', allSales);
      
      // Filter sales for the selected customer
      const customerSales = (allSales.sales || allSales || []).filter((sale: any) => {
        const saleCustomerId = sale.customer?._id || sale.customer;
        return saleCustomerId === customerId;
      });
      
      console.log('Customer sales:', customerSales);
      
      const processedInvoices = customerSales.map((sale: any) => {
        const totalAmount = Number(sale.totalAmount) || 0;
        const paidAmount = Number(sale.paidAmount) || 0;
        const dueAmount = totalAmount - paidAmount;
        
        console.log(`Invoice ${sale.invoiceId}: Total=${totalAmount}, Paid=${paidAmount}, Due=${dueAmount}`);
        
        return {
          ...sale,
          totalAmount,
          paidAmount,
          dueAmount,
          paymentStatus: dueAmount === 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Unpaid')
        };
      });
      
      // Show invoices with due amount > 0 OR partially paid invoices
      const unpaidInvoices = processedInvoices.filter(inv => inv.dueAmount > 0);
      console.log('Unpaid invoices:', unpaidInvoices);
      
      setInvoices(unpaidInvoices);
      
      if (unpaidInvoices.length === 0 && customerSales.length > 0) {
        setError('All invoices for this customer are fully paid');
      } else if (customerSales.length === 0) {
        setError('No invoices found for this customer');
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      setError('Failed to load invoices');
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      let url = '/payments';
      if (startDate && endDate) {
        url = `/payments?startDate=${startDate}&endDate=${endDate}`;
      }
      const data = await apiRequest(url);
      setPayments(data.payments || data || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (error: any) {
      console.error('Error loading payments:', error);
      setError(error.message || 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedInvoiceDetails = (): SalesInvoice | undefined => {
    return invoices.find(inv => inv._id === selectedInvoice);
  };

  const selectedInvoiceData = getSelectedInvoiceDetails();
  const selectedCustomerData = customers.find(c => c._id === selectedCustomer);

  const handleRecordPayment = async () => {
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }
    if (!selectedInvoice) {
      setError('Please select an invoice');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    const amountValue = parseFloat(amount);
    if (selectedInvoiceData && amountValue > (selectedInvoiceData.dueAmount || 0)) {
      setError(`Amount cannot exceed due amount of ${formatCurrency(selectedInvoiceData.dueAmount)}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        customer: selectedCustomer,
        invoice: selectedInvoice,
        amount: amountValue,
        paymentMethod: paymentMethod,
        notes: notes || undefined,
      };

      console.log('Recording payment:', requestBody);

      await apiRequest('/payments', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      setSuccessMessage(`Payment of ${formatCurrency(amountValue)} recorded successfully!`);
      
      setSelectedCustomer('');
      setSelectedInvoice('');
      setAmount('');
      setPaymentMethod('Cash');
      setNotes('');
      
      await Promise.all([
        loadCustomers(),
        loadPayments()
      ]);
    } catch (error: any) {
      console.error('Error recording payment:', error);
      setError(error.message || 'Failed to record payment');
    } finally {
      setIsLoading(false);
    }
  };

  const viewPaymentDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const payment = await apiRequest(`/payments/${id}`);
      setSelectedPayment(payment.payment || payment);
    } catch (error: any) {
      console.error('Error loading payment details:', error);
      setError(error.message || 'Failed to load payment details');
    } finally {
      setIsLoading(false);
    }
  };

  const closePaymentModal = () => {
    setSelectedPayment(null);
  };

  const handleExportCSV = () => {
    const headers = ['Receipt ID', 'Date', 'Customer', 'Invoice', 'Amount (LKR)', 'Payment Method', 'Collected By', 'Notes'];
    const rows = payments.map(p => [
      p.receiptId,
      new Date(p.createdAt).toLocaleDateString(),
      getCustomerName(p.customer),
      getInvoiceDisplay(p.invoice),
      p.amount || 0,
      p.paymentMethod,
      p.salesman?.username || 'Unknown',
      p.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_report_${new Date().toISOString().split('T')[0]}.csv`;
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
        <title>Payments Report</title>
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
        <h1>Payments Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        ${startDate && endDate ? `<p>Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>` : ''}
        
        ${summary ? `
          <div class="summary">
            <h3>Summary</h3>
            <p>Total Payments: ${summary.totalPayments || 0}</p>
            <p>Total Amount: LKR ${(summary.totalAmount || 0).toLocaleString()}</p>
            <p>Average Payment: LKR ${(summary.averagePayment || 0).toLocaleString()}</p>
          </div>
        ` : ''}
        
        <table>
          <thead>
            <tr>
              <th>Receipt ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Invoice</th>
              <th>Amount (LKR)</th>
              <th>Payment Method</th>
              <th>Collected By</th>
            </tr>
          </thead>
          <tbody>
            ${payments.map(p => `
              <tr>
                <td>${p.receiptId || ''}</td>
                <td>${new Date(p.createdAt).toLocaleDateString()}</td>
                <td>${getCustomerName(p.customer)}</div>
                <td>${getInvoiceDisplay(p.invoice)}</div>
                <td>${(p.amount || 0).toLocaleString()}</div>
                <td>${p.paymentMethod || ''}</div>
                <td>${p.salesman?.username || 'Unknown'}</div>
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

  const applyFilters = () => {
    loadPayments();
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setTimeout(() => loadPayments(), 100);
  };

  const getCustomerName = (customer: any): string => {
    if (!customer) return 'Unknown';
    if (typeof customer === 'object') {
      return customer.displayName || `${customer.customerName || ''} - ${customer.shopName || ''}` || 'Unknown';
    }
    return String(customer);
  };

  const getInvoiceDisplay = (invoice: any): string => {
    if (!invoice) return 'Unknown';
    if (typeof invoice === 'object') {
      const due = invoice.dueAmount || 0;
      return `${invoice.invoiceId || 'N/A'} (Due: ${formatCurrency(due)})`;
    }
    return String(invoice);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Collection</h1>
        <p className="text-gray-600">Record customer payments, manage receipts, and track collections</p>
      </div>

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          <div className="flex items-center gap-2"><CheckCircle size={20} /><span className="text-sm">{successMessage}</span></div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2"><span className="text-sm">{error}</span></div>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium opacity-90">Total Payments</p><p className="text-3xl font-bold mt-2">{summary.totalPayments || 0}</p></div>
              <div className="bg-white/20 rounded-full p-3"><FileText size={24} /></div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium opacity-90">Total Amount</p><p className="text-3xl font-bold mt-2">{safeFormatCurrency(summary.totalAmount)}</p></div>
              <div className="bg-white/20 rounded-full p-3"><DollarSign size={24} /></div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium opacity-90">Average Payment</p><p className="text-3xl font-bold mt-2">{safeFormatCurrency(summary.averagePayment)}</p></div>
              <div className="bg-white/20 rounded-full p-3"><Users size={24} /></div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <Filter size={18} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition"><Download size={16} /> Export CSV</button>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition"><Printer size={16} /> Print</button>
            <button onClick={loadPayments} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition"><RefreshCw size={16} /> Refresh</button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" /></div>
            <div className="flex items-end gap-2"><button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">Apply Filters</button><button onClick={resetFilters} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition">Reset</button></div>
          </div>
        )}
      </div>

      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6"><span className="text-xl">💳</span><h2 className="text-lg font-bold text-gray-800">Record Payment / Receipt</h2></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">SELECT CUSTOMER *</label>
            <select value={selectedCustomer} onChange={(e) => { setSelectedCustomer(e.target.value); setSelectedInvoice(''); }} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
              <option value="">Select a customer...</option>
              {customers.map((cust) => (<option key={cust._id} value={cust._id}>{cust.displayName || `${cust.customerName || ''} - ${cust.shopName || ''}`}</option>))}
            </select>
            {selectedCustomerData && (<div className="mt-2 text-sm"><span className="text-gray-600">Outstanding Balance: </span><span className="font-semibold text-red-600">{safeFormatCurrency(selectedCustomerData.balance)}</span></div>)}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">SELECT INVOICE *</label>
            <select value={selectedInvoice} onChange={(e) => setSelectedInvoice(e.target.value)} disabled={!selectedCustomer || invoices.length === 0} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100">
              <option value="">Select an invoice...</option>
              {invoices.map((inv) => (<option key={inv._id} value={inv._id}>{inv.invoiceId} - Due: {safeFormatCurrency(inv.dueAmount)} ({inv.paymentStatus})</option>))}
            </select>
            {!selectedCustomer && <p className="text-xs text-gray-500 mt-1">Please select a customer first</p>}
            {selectedCustomer && invoices.length === 0 && !isLoading && <p className="text-xs text-amber-600 mt-1">No unpaid invoices found for this customer. All invoices are fully paid.</p>}
            {isLoading && <p className="text-xs text-gray-500 mt-1">Loading invoices...</p>}
            {selectedInvoiceData && (
              <div className="mt-2 text-sm">
                <span className="text-gray-600">Invoice Total: </span><span className="font-medium">{safeFormatCurrency(selectedInvoiceData.totalAmount)}</span>
                <span className="text-gray-600 ml-3">Paid: </span><span className="font-medium text-green-600">{safeFormatCurrency(selectedInvoiceData.paidAmount)}</span>
                <span className="text-gray-600 ml-3">Due: </span><span className="font-medium text-red-600">{safeFormatCurrency(selectedInvoiceData.dueAmount)}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">AMOUNT *</label>
            <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            {selectedInvoiceData && amount && parseFloat(amount) > (selectedInvoiceData.dueAmount || 0) && <p className="text-xs text-red-500 mt-1">Amount exceeds due amount</p>}
            {selectedInvoiceData && amount && parseFloat(amount) <= (selectedInvoiceData.dueAmount || 0) && <p className="text-xs text-green-500 mt-1">Remaining due: {safeFormatCurrency((selectedInvoiceData.dueAmount || 0) - parseFloat(amount))}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">PAYMENT METHOD</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
              {paymentMethods.map((method) => (<option key={method} value={method}>{method}</option>))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-2">NOTES</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment notes (optional)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleRecordPayment} disabled={isLoading || !selectedCustomer || !selectedInvoice || !amount} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Processing...' : <><CheckCircle size={18} /> Record Payment</>}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><span className="text-xl">⏱️</span><h2 className="text-lg font-bold text-gray-800">Payment History</h2></div>
          <p className="text-sm text-gray-500">Total: {payments.length} payment{payments.length !== 1 ? 's' : ''}</p>
        </div>

        {isLoading && payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500"><FileText size={48} className="mx-auto text-gray-300 mb-2" /><p>No payments recorded yet</p></div>
        ) : (
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.receiptId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{getCustomerName(payment.customer)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{getInvoiceDisplay(payment.invoice)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">{safeFormatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.paymentMethod || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.salesman?.username || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm"><button onClick={() => viewPaymentDetails(payment._id)} className="text-blue-600 hover:text-blue-800 p-1" title="View Details"><Eye size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-lg font-semibold text-gray-800">Payment Receipt</h3><p className="text-sm text-gray-600">{selectedPayment.receiptId}</p></div>
              <button onClick={closePaymentModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b border-gray-200">
              <div><p className="text-xs text-gray-500">Date</p><p className="text-sm font-medium">{new Date(selectedPayment.createdAt).toLocaleDateString()}</p></div>
              <div><p className="text-xs text-gray-500">Receipt ID</p><p className="text-sm font-medium">{selectedPayment.receiptId}</p></div>
              <div><p className="text-xs text-gray-500">Customer</p><p className="text-sm font-medium">{getCustomerName(selectedPayment.customer)}</p></div>
              <div><p className="text-xs text-gray-500">Invoice</p><p className="text-sm font-medium">{getInvoiceDisplay(selectedPayment.invoice)}</p></div>
              <div><p className="text-xs text-gray-500">Amount</p><p className="text-2xl font-bold text-green-600">{safeFormatCurrency(selectedPayment.amount)}</p></div>
              <div><p className="text-xs text-gray-500">Payment Method</p><p className="text-sm font-medium">{selectedPayment.paymentMethod}</p></div>
              <div><p className="text-xs text-gray-500">Collected By</p><p className="text-sm font-medium">{selectedPayment.salesman?.username || 'Unknown'}</p></div>
              {selectedPayment.notes && (<div className="col-span-2"><p className="text-xs text-gray-500">Notes</p><p className="text-sm text-gray-700">{selectedPayment.notes}</p></div>)}
            </div>

            {selectedPayment.invoice && typeof selectedPayment.invoice === 'object' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Invoice Payment Status</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Total Amount</p><p className="font-medium">{safeFormatCurrency(selectedPayment.invoice.totalAmount)}</p></div>
                  <div><p className="text-gray-500">Paid Amount</p><p className="font-medium text-green-600">{safeFormatCurrency(selectedPayment.invoice.paidAmount)}</p></div>
                  <div><p className="text-gray-500">Due Amount</p><p className="font-medium text-red-600">{safeFormatCurrency(selectedPayment.invoice.dueAmount)}</p></div>
                </div>
                <div className="mt-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedPayment.invoice.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : selectedPayment.invoice.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{selectedPayment.invoice.paymentStatus || 'Unpaid'}</span></div>
              </div>
            )}

            <div className="mt-6 flex justify-end"><button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"><Printer size={16} /> Print Receipt</button></div>
          </div>
        </div>
      )}
    </div>
  );
}