import { useEffect, useState } from 'react';
import { apiRequest } from '../api/api';
import { 
  Plus, Trash2, FileText, Loader, AlertCircle, CheckCircle, X, 
  Edit2, Eye, RefreshCw, Download, Printer 
} from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

interface DashboardData {
  totalSalaryThisMonth: number;
  totalAdvanceGiven: number;
  totalPaid: number;
  pendingBalance: number;
}

interface Staff {
  _id: string;
  fullName: string;
  username: string;
  role: string;
  basicSalary?: number;
}

interface Salary {
  _id: string;
  staffId: Staff;
  month: string;
  salaryDate: string;
  basicSalary: number;
  advancePaid: number;
  salaryPaid: number;
  totalPaid: number;
  balance: number;
  paymentNo: string;
  remarks: string;
  createdAt: string;
}

interface Advance {
  _id: string;
  staffId: Staff;
  amount: number;
  date: string;
  paymentNo: string;
  notes: string;
  createdAt: string;
}

interface MonthlyReport {
  month: string;
  totalStaff: number;
  totalSalary: number;
  totalAdvance: number;
  totalPaid: number;
  totalBalance: number;
  details: Salary[];
}

export default function Salary() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditSalaryModal, setShowEditSalaryModal] = useState(false);
  const [showEditAdvanceModal, setShowEditAdvanceModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedStaffForAdvance, setSelectedStaffForAdvance] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
  const [editingAdvance, setEditingAdvance] = useState<Advance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [salaryForm, setSalaryForm] = useState({
    staffId: '',
    month: new Date().toISOString().slice(0, 7),
    salaryDate: new Date().toISOString().split('T')[0],
    salaryPaid: 0,
    remarks: '',
  });

  const [advanceForm, setAdvanceForm] = useState({
    staffId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [editSalaryForm, setEditSalaryForm] = useState({
    salaryPaid: 0,
    remarks: '',
  });

  const [editAdvanceForm, setEditAdvanceForm] = useState({
    amount: 0,
    date: '',
    notes: '',
  });

  const loadDashboard = async () => {
    try {
      const response = await apiRequest('/salary/dashboard');
      setDashboard(response.dashboard || response);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadSalaries = async () => {
    try {
      const response = await apiRequest('/salary/salary');
      setSalaries(response.salaries || []);
    } catch (error) {
      console.error('Error loading salaries:', error);
    }
  };

  const loadAdvances = async () => {
    try {
      const response = await apiRequest('/salary/advance');
      setAdvances(response.advances || []);
    } catch (error) {
      console.error('Error loading advances:', error);
    }
  };

  const loadStaff = async () => {
    try {
      const response = await apiRequest('/users');
      const staffList = (response || []).filter(
        (user: Staff) => user.role !== 'admin'
      );
      setStaff(staffList);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadDashboard(),
        loadSalaries(),
        loadAdvances(),
        loadStaff(),
      ]);
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

  const handleAddSalary = async () => {
    if (!salaryForm.staffId) {
      setError('Please select a staff member');
      return;
    }
    if (salaryForm.salaryPaid <= 0) {
      setError('Please enter a valid salary amount');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiRequest('/salary/salary', {
        method: 'POST',
        body: JSON.stringify({
          staffId: salaryForm.staffId,
          month: salaryForm.month,
          salaryDate: salaryForm.salaryDate,
          salaryPaid: salaryForm.salaryPaid,
          remarks: salaryForm.remarks,
        }),
      });

      setSuccessMessage('Salary added successfully!');
      setShowSalaryForm(false);
      setSalaryForm({
        staffId: '',
        month: new Date().toISOString().slice(0, 7),
        salaryDate: new Date().toISOString().split('T')[0],
        salaryPaid: 0,
        remarks: '',
      });
      setSelectedStaff('');
      setSelectedRole('');
      await loadData();
    } catch (error: any) {
      setError(error.message || 'Error adding salary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdvance = async () => {
    if (!advanceForm.staffId) {
      setError('Please select a staff member');
      return;
    }
    if (advanceForm.amount <= 0) {
      setError('Please enter a valid advance amount');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiRequest('/salary/advance', {
        method: 'POST',
        body: JSON.stringify({
          staffId: advanceForm.staffId,
          amount: advanceForm.amount,
          date: advanceForm.date,
          notes: advanceForm.notes,
        }),
      });

      setSuccessMessage('Advance added successfully!');
      setShowAdvanceForm(false);
      setAdvanceForm({
        staffId: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setSelectedStaffForAdvance('');
      await loadData();
    } catch (error: any) {
      setError(error.message || 'Error adding advance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSalary = async () => {
    if (!editingSalary) return;
    if (editSalaryForm.salaryPaid <= 0) {
      setError('Please enter a valid salary amount');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiRequest(`/salary/salary/${editingSalary._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          salaryPaid: editSalaryForm.salaryPaid,
          remarks: editSalaryForm.remarks,
        }),
      });

      setSuccessMessage('Salary updated successfully!');
      setShowEditSalaryModal(false);
      setEditingSalary(null);
      await loadData();
    } catch (error: any) {
      setError(error.message || 'Error updating salary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAdvance = async () => {
    if (!editingAdvance) return;
    if (editAdvanceForm.amount <= 0) {
      setError('Please enter a valid advance amount');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiRequest(`/salary/advance/${editingAdvance._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          amount: editAdvanceForm.amount,
          date: editAdvanceForm.date,
          notes: editAdvanceForm.notes,
        }),
      });

      setSuccessMessage('Advance updated successfully!');
      setShowEditAdvanceModal(false);
      setEditingAdvance(null);
      await loadData();
    } catch (error: any) {
      setError(error.message || 'Error updating advance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSalary = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this salary record? This will also remove it from accounts.')) return;

    setIsLoading(true);
    try {
      await apiRequest(`/salary/salary/${id}`, { method: 'DELETE' });
      setSuccessMessage('Salary record deleted successfully!');
      await loadData();
    } catch (error: any) {
      setError(error.message || 'Error deleting salary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdvance = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this advance record? This will also remove it from accounts.')) return;

    setIsLoading(true);
    try {
      await apiRequest(`/salary/advance/${id}`, { method: 'DELETE' });
      setSuccessMessage('Advance record deleted successfully!');
      await loadData();
    } catch (error: any) {
      setError(error.message || 'Error deleting advance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMonthlyReport = async () => {
    if (!reportMonth) {
      setError('Please select a month');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest(`/salary/report/monthly?month=${reportMonth}`);
      setMonthlyReport(response.report || response);
      setShowReportModal(true);
    } catch (error: any) {
      setError(error.message || 'Error generating report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Staff', 'Month', 'Basic Salary', 'Advance Paid', 'Salary Paid', 'Total Paid', 'Balance', 'Payment No'];
    const rows = salaries.map(s => [
      s.staffId?.fullName || 'Unknown',
      s.month,
      s.basicSalary,
      s.advancePaid,
      s.salaryPaid,
      s.totalPaid,
      s.balance,
      s.paymentNo
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary_report_${new Date().toISOString().split('T')[0]}.csv`;
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
        <title>Salary Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1e40af; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; }
        </style>
      </head>
      <body>
        <h1>Salary Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        
        <table>
          <thead>
            <tr><th>Staff</th><th>Month</th><th>Basic</th><th>Advance</th><th>Paid</th><th>Total</th><th>Balance</th></tr>
          </thead>
          <tbody>
            ${salaries.map(s => `
              <tr>
                <td>${s.staffId?.fullName || 'Unknown'}</td>
                <td>${s.month}</td>
                <td>${s.basicSalary.toLocaleString()}</td>
                <td>${s.advancePaid.toLocaleString()}</td>
                <td>${s.salaryPaid.toLocaleString()}</td>
                <td>${s.totalPaid.toLocaleString()}</td>
                <td>${s.balance.toLocaleString()}</td>
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

  const openEditSalary = (salary: Salary) => {
    setEditingSalary(salary);
    setEditSalaryForm({
      salaryPaid: salary.salaryPaid,
      remarks: salary.remarks || '',
    });
    setShowEditSalaryModal(true);
  };

  const openEditAdvance = (advance: Advance) => {
    setEditingAdvance(advance);
    setEditAdvanceForm({
      amount: advance.amount,
      date: advance.date.split('T')[0],
      notes: advance.notes || '',
    });
    setShowEditAdvanceModal(true);
  };

  const filteredStaff = selectedRole
    ? staff.filter((s) => s.role === selectedRole)
    : staff;

  const getStaffBasicSalary = () => {
    const staffMember = staff.find(s => s._id === salaryForm.staffId);
    return staffMember?.basicSalary || 0;
  };

  const getStaffBasicSalaryForAdvance = () => {
    const staffMember = staff.find(s => s._id === advanceForm.staffId);
    return staffMember?.basicSalary || 0;
  };

  if (isLoading && !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading salary data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Salary Management</h1>
        <p className="text-gray-600">Admin only access - Manage staff salaries, advances, and accounts integration</p>
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

      {/* Dashboard Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm font-medium">Total Salary This Month</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(dashboard.totalSalaryThisMonth)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-gray-500 text-sm font-medium">Total Advance Given</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(dashboard.totalAdvanceGiven)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm font-medium">Total Paid</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(dashboard.totalPaid)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-gray-500 text-sm font-medium">Pending Balance</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {formatCurrency(dashboard.pendingBalance)}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-8">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowSalaryForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Plus size={18} />
            Add Salary
          </button>
          <button
            onClick={() => setShowAdvanceForm(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Plus size={18} />
            Add Advance
          </button>
          <button
            onClick={handleGenerateMonthlyReport}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <FileText size={18} />
            Monthly Report
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Printer size={18} />
            Print Report
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Salary Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Salary Payments</h3>
          <p className="text-sm text-gray-500">
            Total: {salaries.length} record{salaries.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Month</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Basic</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Advance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salaries.length > 0 ? (
                salaries.map((salary) => (
                  <tr key={salary._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{salary.staffId?.fullName || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{salary.month}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(salary.basicSalary)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(salary.advancePaid)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(salary.salaryPaid)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(salary.totalPaid)}</td>
                    <td className="px-6 py-4 text-sm text-red-600">{formatCurrency(salary.balance)}</td>
                    <td className="px-6 py-4 text-sm font-mono text-xs">{salary.paymentNo}</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => openEditSalary(salary)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSalary(salary._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No salary records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advances Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Advance Payments</h3>
          <p className="text-sm text-gray-500">
            Total: {advances.length} record{advances.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {advances.length > 0 ? (
                advances.map((advance) => (
                  <tr key={advance._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{advance.staffId?.fullName || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(advance.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-orange-600">{formatCurrency(advance.amount)}</td>
                    <td className="px-6 py-4 text-sm font-mono text-xs">{advance.paymentNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{advance.notes || '-'}</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => openEditAdvance(advance)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAdvance(advance._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No advance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Salary Form Modal */}
      {showSalaryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Add Salary</h3>
              <button onClick={() => setShowSalaryForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setSalaryForm({ ...salaryForm, staffId: '' });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="salesman">Salesman</option>
                  <option value="store_manager">Store Manager</option>
                  <option value="production_manager">Production Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Staff *</label>
                <select
                  value={salaryForm.staffId}
                  onChange={(e) => setSalaryForm({ ...salaryForm, staffId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose staff...</option>
                  {filteredStaff.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                <input
                  type="month"
                  value={salaryForm.month}
                  onChange={(e) => setSalaryForm({ ...salaryForm, month: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Date *</label>
                <input
                  type="date"
                  value={salaryForm.salaryDate}
                  onChange={(e) => setSalaryForm({ ...salaryForm, salaryDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary</label>
                <input
                  type="text"
                  value={formatCurrency(getStaffBasicSalary())}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Basic salary from staff profile</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Paid (LKR) *</label>
                <input
                  type="number"
                  placeholder="Enter salary amount"
                  value={salaryForm.salaryPaid}
                  onChange={(e) => setSalaryForm({ ...salaryForm, salaryPaid: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <input
                  type="text"
                  placeholder="Monthly salary payment"
                  value={salaryForm.remarks}
                  onChange={(e) => setSalaryForm({ ...salaryForm, remarks: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleAddSalary}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Salary'}
                </button>
                <button
                  onClick={() => setShowSalaryForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Advance Form Modal */}
      {showAdvanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Add Advance</h3>
              <button onClick={() => setShowAdvanceForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Staff *</label>
                <select
                  value={advanceForm.staffId}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, staffId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose staff...</option>
                  {staff.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} ({s.role}) - Basic: {formatCurrency(s.basicSalary || 0)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary</label>
                <input
                  type="text"
                  value={formatCurrency(getStaffBasicSalaryForAdvance())}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (LKR) *</label>
                <input
                  type="number"
                  placeholder="Enter advance amount"
                  value={advanceForm.amount}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                {advanceForm.amount > (getStaffBasicSalaryForAdvance() || 0) && (
                  <p className="text-xs text-red-500 mt-1">Amount exceeds basic salary!</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={advanceForm.date}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <input
                  type="text"
                  placeholder="Emergency advance"
                  value={advanceForm.notes}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleAddAdvance}
                  disabled={isLoading}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Advance'}
                </button>
                <button
                  onClick={() => setShowAdvanceForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Salary Modal */}
      {showEditSalaryModal && editingSalary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Salary - {editingSalary.staffId?.fullName} ({editingSalary.month})
              </h3>
              <button onClick={() => setShowEditSalaryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary</label>
                <input
                  type="text"
                  value={formatCurrency(editingSalary.basicSalary)}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Advance Paid</label>
                <input
                  type="text"
                  value={formatCurrency(editingSalary.advancePaid)}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Paid (LKR) *</label>
                <input
                  type="number"
                  value={editSalaryForm.salaryPaid}
                  onChange={(e) => setEditSalaryForm({ ...editSalaryForm, salaryPaid: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <input
                  type="text"
                  value={editSalaryForm.remarks}
                  onChange={(e) => setEditSalaryForm({ ...editSalaryForm, remarks: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Total Paid: {formatCurrency(editingSalary.advancePaid + editSalaryForm.salaryPaid)}</p>
                <p className="text-sm text-gray-600">Balance: {formatCurrency(editingSalary.basicSalary - (editingSalary.advancePaid + editSalaryForm.salaryPaid))}</p>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleUpdateSalary}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Salary'}
                </button>
                <button
                  onClick={() => setShowEditSalaryModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Advance Modal */}
      {showEditAdvanceModal && editingAdvance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Advance - {editingAdvance.staffId?.fullName}
              </h3>
              <button onClick={() => setShowEditAdvanceModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (LKR) *</label>
                <input
                  type="number"
                  value={editAdvanceForm.amount}
                  onChange={(e) => setEditAdvanceForm({ ...editAdvanceForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={editAdvanceForm.date}
                  onChange={(e) => setEditAdvanceForm({ ...editAdvanceForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <input
                  type="text"
                  value={editAdvanceForm.notes}
                  onChange={(e) => setEditAdvanceForm({ ...editAdvanceForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleUpdateAdvance}
                  disabled={isLoading}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Advance'}
                </button>
                <button
                  onClick={() => setShowEditAdvanceModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
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
              <h3 className="text-lg font-semibold text-gray-800">Monthly Salary Report - {monthlyReport.month}</h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Total Staff</p>
                <p className="text-xl font-bold text-blue-600">{monthlyReport.totalStaff}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Total Salary</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(monthlyReport.totalSalary)}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Total Advance</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(monthlyReport.totalAdvance)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Total Paid</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(monthlyReport.totalPaid)}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Total Balance</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(monthlyReport.totalBalance)}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Staff</th>
                    <th className="px-4 py-2 text-left">Basic</th>
                    <th className="px-4 py-2 text-left">Advance</th>
                    <th className="px-4 py-2 text-left">Paid</th>
                    <th className="px-4 py-2 text-left">Total</th>
                    <th className="px-4 py-2 text-left">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {monthlyReport.details?.map((salary) => (
                    <tr key={salary._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{salary.staffId?.fullName}</td>
                      <td className="px-4 py-2">{formatCurrency(salary.basicSalary)}</td>
                      <td className="px-4 py-2">{formatCurrency(salary.advancePaid)}</td>
                      <td className="px-4 py-2">{formatCurrency(salary.salaryPaid)}</td>
                      <td className="px-4 py-2">{formatCurrency(salary.totalPaid)}</td>
                      <td className="px-4 py-2 text-red-600">{formatCurrency(salary.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}