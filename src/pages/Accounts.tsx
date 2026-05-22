import { X, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/api';
import { RefreshCw, Download, Printer, Filter, Loader, AlertCircle, CheckCircle, Eye, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

interface DashboardData {
  expectedIncome: number;
  receivedIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalIncomeToday: number;
  totalExpenseToday: number;
  totalIncomeMonth: number;
  totalExpenseMonth: number;
  monthlyProfit: number;
  currentBalance: number;
  expenseBreakdown: {
    expenses: number;
    salary: number;
    advance: number;
    production: number;
  };
}

interface Transaction {
  _id: string;
  date: string;
  invoiceNo: string;
  description: string;
  income: number;
  expense: number;
  balance: number;
  totalAmount: number;
  sourceModule: string;
  sourceId: string;
  enteredBy: {
    _id: string;
    fullName: string;
    username: string;
  };
  notes: string;
  createdAt: string;
}

interface TransactionSummary {
  expectedIncome: number;
  receivedIncome: number;
  totalExpense: number;
  netProfit: number;
  expenseBreakdown: {
    expense: number;
    salary: number;
    advance: number;
    production: number;
  };
}

interface MonthlyReport {
  year: number;
  month: number;
  expectedIncome: number;
  receivedIncome: number;
  totalExpense: number;
  netProfit: number;
  breakdown: {
    income: {
      sales: number;
      payment: number;
    };
    expense: {
      expense: number;
      salary: number;
      advance: number;
      production: number;
    };
  };
}

export default function Accounts() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter states
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionType, setTransactionType] = useState('all');
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);

  const loadDashboard = async () => {
    try {
      const response = await apiRequest('/accounts/dashboard');
      setDashboard(response.dashboard || response);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      throw error;
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await apiRequest('/accounts/transactions');
      setTransactions(response.transactions || []);
      setFilteredTransactions(response.transactions || []);
      if (response.summary) {
        setSummary(response.summary);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      throw error;
    }
  };

  const loadMonthlyReport = async () => {
    try {
      const response = await apiRequest(`/accounts/report/monthly?year=${reportYear}&month=${reportMonth}`);
      setMonthlyReport(response.report);
      setShowReportModal(true);
    } catch (error: any) {
      console.error('Error loading monthly report:', error);
      setError(error.message || 'Failed to load monthly report');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadDashboard(),
        loadTransactions(),
      ]);
      setSuccessMessage('Data refreshed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const handleFilter = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(transactionType !== 'all' && { type: transactionType }),
      });

      const response = await apiRequest(`/accounts/transactions/filter?${params.toString()}`);
      
      setFilteredTransactions(response.transactions || []);
      if (response.summary) {
        setSummary(response.summary);
      }
      setSuccessMessage('Filter applied successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error filtering:', error);
      setError(error.message || 'Failed to filter transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTransaction = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest(`/accounts/transactions/${id}`);
      setSelectedTransaction(response.transaction);
    } catch (error: any) {
      setError(error.message || 'Failed to load transaction details');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Accounts Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1e40af; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; }
          .summary { margin-top: 20px; padding: 10px; background-color: #f3f4f6; border-radius: 5px; }
          .income { color: #16a34a; }
          .expense { color: #dc2626; }
        </style>
      </head>
      <body>
        <h1>Accounts Report</h1>
        <p>Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
        
        <h2>Financial Summary</h2>
        <div class="summary">
          <p>Expected Income: LKR ${summary?.expectedIncome?.toLocaleString() || 0}</p>
          <p>Received Income: LKR ${summary?.receivedIncome?.toLocaleString() || 0}</p>
          <p>Total Expenses: LKR ${summary?.totalExpense?.toLocaleString() || 0}</p>
          <p>Net Profit: LKR ${summary?.netProfit?.toLocaleString() || 0}</p>
        </div>
        
        <h2>Transaction Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice No</th>
              <th>Description</th>
              <th>Source</th>
              <th>Income (LKR)</th>
              <th>Expense (LKR)</th>
              <th>Balance (LKR)</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransactions.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.invoiceNo}</td>
                <td>${t.description}</td>
                <td>${t.sourceModule || 'General'}</td>
                <td class="income">${t.income > 0 ? t.income.toLocaleString() : '-'}</td>
                <td class="expense">${t.expense > 0 ? t.expense.toLocaleString() : '-'}</td>
                <td>${t.balance.toLocaleString()}</td>
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

  const handleExportCSV = () => {
    const headers = ['Date', 'Invoice No', 'Description', 'Source', 'Income (LKR)', 'Expense (LKR)', 'Balance (LKR)', 'Entered By'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.invoiceNo,
      t.description,
      t.sourceModule || 'General',
      t.income || 0,
      t.expense || 0,
      t.balance,
      t.enteredBy?.fullName || 'System'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounts_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setSuccessMessage('Report exported successfully!');
  };

  const getSourceBadgeColor = (sourceModule: string) => {
    const colors: Record<string, string> = {
      sales: 'bg-green-100 text-green-800',
      payment: 'bg-emerald-100 text-emerald-800',
      expense: 'bg-red-100 text-red-800',
      salary: 'bg-yellow-100 text-yellow-800',
      advance: 'bg-orange-100 text-orange-800',
      production: 'bg-purple-100 text-purple-800',
    };
    return colors[sourceModule?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getSourceIcon = (sourceModule: string) => {
    const icons: Record<string, string> = {
      sales: '💰',
      payment: '💳',
      expense: '📉',
      salary: '👔',
      advance: '🏦',
      production: '🏭',
    };
    return icons[sourceModule?.toLowerCase()] || '📋';
  };

  if (isLoading && !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading accounts data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Accounts Management</h1>
        <p className="text-gray-600">Complete financial overview - Sales, Payments, Expenses, Salary & Advances</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} />
            <span className="text-sm">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Main Financial Summary Cards */}
      {dashboard && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Expected Income</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(dashboard.expectedIncome)}</p>
                  <p className="text-xs opacity-75 mt-1">From Sales Invoices</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Received Income</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(dashboard.receivedIncome)}</p>
                  <p className="text-xs opacity-75 mt-1">From Payments</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Wallet size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Total Expenses</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(dashboard.totalExpenses)}</p>
                  <p className="text-xs opacity-75 mt-1">Expenses + Salary + Advances</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <TrendingDown size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Net Profit</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(dashboard.netProfit)}</p>
                  <p className="text-xs opacity-75 mt-1">Received - Expenses</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Expense Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <p className="text-sm text-gray-600">General Expenses</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(dashboard.expenseBreakdown?.expenses || 0)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-600">Salary Expenses</p>
              <p className="text-xl font-bold text-yellow-600">{formatCurrency(dashboard.expenseBreakdown?.salary || 0)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
              <p className="text-sm text-gray-600">Advance Payments</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(dashboard.expenseBreakdown?.advance || 0)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
              <p className="text-sm text-gray-600">Collection Rate</p>
              <p className="text-xl font-bold text-purple-600">
                {dashboard.expectedIncome ? ((dashboard.receivedIncome / dashboard.expectedIncome) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>

          {/* Daily & Monthly Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Today's Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Income:</span>
                  <span className="text-sm font-semibold text-green-600">{formatCurrency(dashboard.totalIncomeToday)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Expenses:</span>
                  <span className="text-sm font-semibold text-red-600">{formatCurrency(dashboard.totalExpenseToday)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Net:</span>
                  <span className="text-sm font-bold">{formatCurrency(dashboard.totalIncomeToday - dashboard.totalExpenseToday)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">This Month</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Income:</span>
                  <span className="text-sm font-semibold text-green-600">{formatCurrency(dashboard.totalIncomeMonth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Expenses:</span>
                  <span className="text-sm font-semibold text-red-600">{formatCurrency(dashboard.totalExpenseMonth)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Profit:</span>
                  <span className="text-sm font-bold text-purple-600">{formatCurrency(dashboard.monthlyProfit)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Current Balance</h3>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(dashboard.currentBalance)}</p>
                <div className="bg-blue-100 rounded-full p-3">
                  <Wallet size={24} className="text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Running balance from all transactions</p>
            </div>
          </div>
        </>
      )}

      {/* Quick Stats Row from Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-gray-600">Expected Income (All Time)</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(summary.expectedIncome)}</p>
            <p className="text-xs text-green-600 mt-1">From Sales Invoices</p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600">Received Income (All Time)</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(summary.receivedIncome)}</p>
            <p className="text-xs text-blue-600 mt-1">From Payments</p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-gray-600">Net Profit (All Time)</p>
            <p className="text-2xl font-bold text-purple-700">{formatCurrency(summary.netProfit)}</p>
            <p className="text-xs text-purple-600 mt-1">Received - Expenses</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Transactions</option>
              <option value="income">Income Only (Sales + Payments)</option>
              <option value="expense">Expense Only (Expenses + Salary + Advances)</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleFilter}
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              {isLoading ? <Loader size={18} className="animate-spin" /> : <Filter size={18} />}
              Apply Filter
            </button>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadMonthlyReport}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              Monthly Report
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Download size={18} />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Printer size={18} />
            Print Report
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Transaction Ledger</h3>
          <p className="text-sm text-gray-500">
            Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Income (LKR)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expense (LKR)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Balance (LKR)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Entered By</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{transaction.invoiceNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{transaction.description}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSourceBadgeColor(transaction.sourceModule)}`}>
                        <span>{getSourceIcon(transaction.sourceModule)}</span>
                        {transaction.sourceModule || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      {transaction.income > 0 ? formatCurrency(transaction.income) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-red-600">
                      {transaction.expense > 0 ? formatCurrency(transaction.expense) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      {formatCurrency(transaction.balance)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {transaction.enteredBy?.fullName || transaction.enteredBy?.username || 'System'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleViewTransaction(transaction._id)}
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
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <p>No transactions found</p>
                      <p className="text-sm">Try adjusting your filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Section */}
      {summary && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600">Expected Income</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {formatCurrency(summary.expectedIncome)}
              </p>
              <p className="text-xs text-gray-500 mt-2">From Sales Invoices</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600">Received Income</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {formatCurrency(summary.receivedIncome)}
              </p>
              <p className="text-xs text-gray-500 mt-2">From Payments</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-gray-600">Net Profit</p>
              <p className={`text-3xl font-bold mt-2 ${summary.netProfit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                {formatCurrency(summary.netProfit)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Received Income - Total Expenses</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">
                <strong>Note:</strong> All financial transactions are automatically recorded from:
                <span className="text-green-600 ml-2">Sales</span>,
                <span className="text-emerald-600 ml-1">Payments</span>,
                <span className="text-red-600 ml-1">Expenses</span>,
                <span className="text-yellow-600 ml-1">Salary</span>,
                <span className="text-orange-600 ml-1">Advances</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Transaction Details</h3>
              <button onClick={() => setSelectedTransaction(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-medium">{new Date(selectedTransaction.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Invoice No</p>
                  <p className="text-sm font-medium">{selectedTransaction.invoiceNo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Source Module</p>
                  <p className="text-sm font-medium capitalize">{selectedTransaction.sourceModule}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Entered By</p>
                  <p className="text-sm font-medium">{selectedTransaction.enteredBy?.fullName || 'System'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm text-gray-700">{selectedTransaction.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Income</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(selectedTransaction.income)}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Expense</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(selectedTransaction.expense)}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Balance</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(selectedTransaction.balance)}</p>
                </div>
              </div>

              {selectedTransaction.notes && (
                <div>
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-sm text-gray-600">{selectedTransaction.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">Created At</p>
                <p className="text-xs text-gray-400">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Report Modal */}
      {showReportModal && monthlyReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Monthly Report - {new Date(reportYear, reportMonth - 1).toLocaleString('default', { month: 'long' })} {reportYear}
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Expected Income</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(monthlyReport.expectedIncome)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Received Income</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(monthlyReport.receivedIncome)}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Total Expenses</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(monthlyReport.totalExpense)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Net Profit</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(monthlyReport.netProfit)}</p>
              </div>
            </div>

            <h4 className="font-semibold text-gray-800 mb-3">Income Breakdown</h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">Sales Income</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(monthlyReport.breakdown?.income?.sales || 0)}</p>
              </div>
              <div className="bg-emerald-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">Payment Income</p>
                <p className="text-lg font-bold text-emerald-700">{formatCurrency(monthlyReport.breakdown?.income?.payment || 0)}</p>
              </div>
            </div>

            <h4 className="font-semibold text-gray-800 mb-3">Expense Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">General Expenses</p>
                <p className="text-lg font-bold text-red-700">{formatCurrency(monthlyReport.breakdown?.expense?.expense || 0)}</p>
              </div>
              <div className="bg-yellow-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">Salary</p>
                <p className="text-lg font-bold text-yellow-700">{formatCurrency(monthlyReport.breakdown?.expense?.salary || 0)}</p>
              </div>
              <div className="bg-orange-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">Advances</p>
                <p className="text-lg font-bold text-orange-700">{formatCurrency(monthlyReport.breakdown?.expense?.advance || 0)}</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">Production</p>
                <p className="text-lg font-bold text-purple-700">{formatCurrency(monthlyReport.breakdown?.expense?.production || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}