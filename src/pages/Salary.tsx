import { useEffect, useState } from 'react';
import { apiRequest } from '../api/api';
import { Plus, Eye, Trash2, Download, Printer, FileText } from 'lucide-react';

interface DashboardData {
  totalSalaryThisMonth: number;
  totalAdvanceGiven: number;
  totalPaid: number;
  pendingBalance: number;
}

interface Salary {
  _id: string;
  staffId: {
    _id: string;
    fullName: string;
    role: string;
  };
  month: string;
  salaryDate: string;
  basicSalary: number;
  advancePaid: number;
  salaryPaid: number;
  totalPaid: number;
  balance: number;
  paymentNo: string;
  remarks: string;
}

interface Advance {
  _id: string;
  staffId: {
    _id: string;
    fullName: string;
  };
  amount: number;
  date: string;
  paymentNo: string;
  notes: string;
}

interface Staff {
  _id: string;
  fullName: string;
  username: string;
  role: string;
}

export default function Salary() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedStaffForAdvance, setSelectedStaffForAdvance] = useState('');
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));

  // Form states
  const [salaryForm, setSalaryForm] = useState({
    staffId: '',
    month: new Date().toISOString().slice(0, 7),
    salaryDate: new Date().toISOString().split('T')[0],
    basicSalary: 0,
    advancePaid: 0,
    salaryPaid: 0,
    remarks: '',
  });

  const [advanceForm, setAdvanceForm] = useState({
    staffId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const loadData = async () => {
    try {
      const [dashboardData, salariesData, advancesData, staffData] = await Promise.all([
        apiRequest('/salary/dashboard'),
        apiRequest('/salary/salary'),
        apiRequest('/salary/advance'),
        apiRequest('/users?role=salesman'),
      ]);

      setDashboard(dashboardData);
      setSalaries(salariesData.salaries || []);
      setAdvances(advancesData.advances || []);
      setStaff(staffData.users || []);
    } catch (error) {
      console.error('Error loading salary data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSalary = async () => {
    try {
      if (!selectedStaff) {
        alert('Please select a staff member');
        return;
      }

      const staffMember = staff.find((s) => s._id === selectedStaff);
      
      await apiRequest('/salary/salary', {
        method: 'POST',
        body: JSON.stringify({
          staffId: selectedStaff,
          month: salaryForm.month,
          salaryDate: salaryForm.salaryDate,
          salaryPaid: salaryForm.salaryPaid,
          remarks: salaryForm.remarks,
        }),
      });

      setShowSalaryForm(false);
      setSelectedRole('');
      setSelectedStaff('');
      setSalaryForm({
        staffId: '',
        month: new Date().toISOString().slice(0, 7),
        salaryDate: new Date().toISOString().split('T')[0],
        basicSalary: 0,
        advancePaid: 0,
        salaryPaid: 0,
        remarks: '',
      });
      loadData();
      alert('Salary added successfully!');
    } catch (error) {
      alert('Error adding salary');
    }
  };

  const handleAddAdvance = async () => {
    try {
      if (!selectedStaffForAdvance || !advanceForm.amount) {
        alert('Please fill all fields');
        return;
      }

      await apiRequest('/salary/advance', {
        method: 'POST',
        body: JSON.stringify({
          staffId: selectedStaffForAdvance,
          amount: advanceForm.amount,
          date: advanceForm.date,
          notes: advanceForm.notes,
        }),
      });

      setShowAdvanceForm(false);
      setSelectedStaffForAdvance('');
      setAdvanceForm({
        staffId: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      loadData();
      alert('Advance added successfully!');
    } catch (error) {
      alert('Error adding advance');
    }
  };

  const generatePayslip = async (salaryId: string) => {
    try {
      const response = await fetch(`/api/salary/salary/${salaryId}`, {
        method: 'POST',
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    } catch (error) {
      alert('Error generating payslip');
    }
  };

  const filteredStaff = selectedRole
    ? staff.filter((s) => s.role === selectedRole)
    : staff;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Salary Management</h1>
        <p className="text-gray-600">Admin only access - Manage staff salaries, advances, and payslips</p>
      </div>

      {/* Dashboard Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm font-medium">Total Salary This Month</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              LKR {dashboard.totalSalaryThisMonth.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-gray-500 text-sm font-medium">Total Advance Given</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              LKR {dashboard.totalAdvanceGiven.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm font-medium">Total Paid</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              LKR {dashboard.totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-gray-500 text-sm font-medium">Pending Balance</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              LKR {dashboard.pendingBalance.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowSalaryForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Plus size={18} />
            ADD SALARY
          </button>
          <button
            onClick={() => setShowAdvanceForm(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Plus size={18} />
            ADD ADVANCE
          </button>
          <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition">
            <FileText size={18} />
            GENERATE PAYSLIP
          </button>
          <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition">
            <Download size={18} />
            MONTHLY REPORT
          </button>
          <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition">
            <Download size={18} />
            EXPORT EXCEL
          </button>
          <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition">
            <Printer size={18} />
            PRINT
          </button>
        </div>
      </div>

      {/* Salary Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Salary Payments</h3>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salaries.length > 0 ? (
                salaries.map((salary) => (
                  <tr key={salary._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{salary.staffId.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{salary.month}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">LKR {salary.basicSalary.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">LKR {salary.advancePaid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">LKR {salary.salaryPaid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">LKR {salary.totalPaid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">LKR {salary.balance.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => generatePayslip(salary._id)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No salary records found
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
            <h3 className="text-lg font-semibold text-gray-800 mb-6">ADD SALARY</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setSelectedStaff('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose role...</option>
                  <option value="salesman">Salesman</option>
                  <option value="store-manager">Store Manager</option>
                  <option value="production-manager">Production Mgr</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Staff</label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
                <input
                  type="month"
                  value={salaryForm.month}
                  onChange={(e) => setSalaryForm({ ...salaryForm, month: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Date</label>
                <input
                  type="date"
                  value={salaryForm.salaryDate}
                  onChange={(e) => setSalaryForm({ ...salaryForm, salaryDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Paid (LKR)</label>
                <input
                  type="number"
                  value={salaryForm.salaryPaid}
                  onChange={(e) => setSalaryForm({ ...salaryForm, salaryPaid: parseInt(e.target.value) || 0 })}
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  SAVE
                </button>
                <button
                  onClick={() => setShowSalaryForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
                >
                  CANCEL
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
            <h3 className="text-lg font-semibold text-gray-800 mb-6">ADD ADVANCE</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Staff</label>
                <select
                  value={selectedStaffForAdvance}
                  onChange={(e) => setSelectedStaffForAdvance(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose staff...</option>
                  {staff.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (LKR)</label>
                <input
                  type="number"
                  value={advanceForm.amount}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, amount: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
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
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  SAVE
                </button>
                <button
                  onClick={() => setShowAdvanceForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}