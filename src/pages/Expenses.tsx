import { useEffect, useState } from "react";
import { 
  Box, 
  Button, 
  MenuItem, 
  Paper, 
  TextField, 
  Typography, 
  Alert, 
  Snackbar, 
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { 
  Add, 
  Delete, 
  Edit, 
  Refresh, 
  Print, 
  Download, 
  FilterList,
  Close,
  Category,
  DateRange,
  Payments,
  AttachMoney
} from "@mui/icons-material";
import { apiRequest } from "../api/api";

const categories = ["Raw Material", "Packaging", "Transport", "Utility", "Maintenance", "Labour", "Office Expense", "Other"];
const paymentMethods = ["Cash", "Bank", "Card"];

interface Expense {
  _id: string;
  date: string;
  category: string;
  subject: string;
  invoiceNo: string;
  amount: number;
  paymentMethod: string;
  enteredBy: {
    _id: string;
    fullName: string;
    username: string;
    role: string;
  };
  createdAt: string;
}

interface Totals {
  daily: number;
  monthly: number;
  yearly: number;
  categoryBreakdown: Array<{ _id: string; total: number }>;
}

interface ExpenseSummary {
  totalExpenses: number;
  totalAmount: number;
  categoryBreakdown: Record<string, number>;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totals, setTotals] = useState<Totals>({
    daily: 0,
    monthly: 0,
    yearly: 0,
    categoryBreakdown: []
  });
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  
  // Form states
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: "Raw Material",
    subject: "",
    invoiceNo: "",
    amount: 0,
    paymentMethod: "Cash",
  });

  const [editForm, setEditForm] = useState({
    _id: "",
    date: "",
    category: "",
    subject: "",
    invoiceNo: "",
    amount: 0,
    paymentMethod: "",
  });

  const loadExpenses = async () => {
    setLoading(true);
    try {
      // Build query params for filters
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (filterCategory) params.append("category", filterCategory);
      
      const queryString = params.toString();
      const url = queryString ? `/expenses?${queryString}` : "/expenses";
      
      const [expensesData, totalsData] = await Promise.all([
        apiRequest(url),
        apiRequest("/expenses/totals"),
      ]);
      
      setExpenses(expensesData.expenses || expensesData || []);
      setSummary(expensesData.summary || null);
      setTotals(totalsData.totals || totalsData);
    } catch (error: any) {
      console.error("Error loading expenses:", error);
      setSnackbar({ open: true, message: error.message || "Failed to load expenses", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [startDate, endDate, filterCategory]);

  const addExpense = async () => {
    // Validation
    if (!form.date) {
      setSnackbar({ open: true, message: "Please select a date", severity: "error" });
      return;
    }
    if (!form.subject.trim()) {
      setSnackbar({ open: true, message: "Please enter a subject/purchase name", severity: "error" });
      return;
    }
    if (!form.invoiceNo.trim()) {
      setSnackbar({ open: true, message: "Please enter an invoice number", severity: "error" });
      return;
    }
    if (form.amount <= 0) {
      setSnackbar({ open: true, message: "Please enter a valid amount greater than 0", severity: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const requestBody = {
        date: form.date,
        category: form.category,
        subject: form.subject.trim(),
        invoiceNo: form.invoiceNo.trim(),
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
      };

      await apiRequest("/expenses", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      
      // Reset form
      setForm({
        date: new Date().toISOString().split('T')[0],
        category: "Raw Material",
        subject: "",
        invoiceNo: "",
        amount: 0,
        paymentMethod: "Cash",
      });
      
      await loadExpenses();
      setSnackbar({ open: true, message: "Expense added successfully!", severity: "success" });
    } catch (error: any) {
      console.error("Error adding expense:", error);
      setSnackbar({ open: true, message: error.message || "Failed to add expense", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const updateExpense = async () => {
    if (!editForm._id) return;
    
    setSubmitting(true);
    try {
      const requestBody = {
        date: editForm.date,
        category: editForm.category,
        subject: editForm.subject,
        invoiceNo: editForm.invoiceNo,
        amount: editForm.amount,
        paymentMethod: editForm.paymentMethod,
      };

      await apiRequest(`/expenses/${editForm._id}`, {
        method: "PUT",
        body: JSON.stringify(requestBody),
      });
      
      setEditDialogOpen(false);
      setSelectedExpense(null);
      await loadExpenses();
      setSnackbar({ open: true, message: "Expense updated successfully!", severity: "success" });
    } catch (error: any) {
      console.error("Error updating expense:", error);
      setSnackbar({ open: true, message: error.message || "Failed to update expense", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense? This will also remove it from accounts ledger.")) return;
    
    try {
      await apiRequest(`/expenses/${id}`, { method: "DELETE" });
      await loadExpenses();
      setSnackbar({ open: true, message: "Expense deleted successfully!", severity: "success" });
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      setSnackbar({ open: true, message: error.message || "Failed to delete expense", severity: "error" });
    }
  };

  const openEditDialog = (expense: Expense) => {
    setEditForm({
      _id: expense._id,
      date: expense.date.split('T')[0],
      category: expense.category,
      subject: expense.subject,
      invoiceNo: expense.invoiceNo,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
    });
    setEditDialogOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Category", "Subject", "Invoice No", "Amount (LKR)", "Payment Method", "Entered By"];
    const rows = expenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      exp.category,
      exp.subject,
      exp.invoiceNo,
      exp.amount,
      exp.paymentMethod,
      exp.enteredBy?.fullName || "Unknown"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: "Report exported successfully!", severity: "success" });
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setSnackbar({ open: true, message: "Please allow pop-ups to print", severity: "error" });
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Expenses Report</title>
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
        <h1>Expenses Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        ${filterCategory ? `<p>Category: ${filterCategory}</p>` : ""}
        ${startDate && endDate ? `<p>Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>` : ""}
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Subject</th>
              <th>Invoice No</th>
              <th>Amount (LKR)</th>
              <th>Payment Method</th>
              <th>Entered By</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(exp => `
              <tr>
                <td>${new Date(exp.date).toLocaleDateString()}</td>
                <td>${exp.category}</td>
                <td>${exp.subject}</td>
                <td>${exp.invoiceNo}</td>
                <td>${exp.amount.toLocaleString()}</td>
                <td>${exp.paymentMethod}</td>
                <td>${exp.enteredBy?.fullName || "Unknown"}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <h3>Summary</h3>
          <p>Total Expenses: ${expenses.length}</p>
          <p>Total Amount: LKR ${expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterCategory("");
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Raw Material": "#f44336",
      "Packaging": "#2196f3",
      "Transport": "#4caf50",
      "Utility": "#ff9800",
      "Maintenance": "#9c27b0",
      "Labour": "#795548",
      "Office Expense": "#607d8b",
      "Other": "#9e9e9e"
    };
    return colors[category] || "#757575";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>Expense Management</Typography>

      {/* Summary Cards */}
      {totals && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e3f2fd" }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Today's Expenses</Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  LKR {totals.daily?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e8f5e9" }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">This Month</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  LKR {totals.monthly?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#fff3e0" }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">This Year</Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  LKR {totals.yearly?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#fce4ec" }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Total Expenses</Typography>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {summary?.totalExpenses || expenses.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Add Expense Form */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" mb={2} fontWeight="semibold">Add New Expense</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField 
              type="date" 
              label="Date" 
              InputLabelProps={{ shrink: true }} 
              value={form.date} 
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField 
              select 
              label="Category" 
              value={form.category} 
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              fullWidth
            >
              {categories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField 
              label="Subject / Purchase Name" 
              value={form.subject} 
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField 
              label="Invoice No" 
              value={form.invoiceNo} 
              onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField 
              label="Amount (LKR)" 
              type="number" 
              value={form.amount} 
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              required
              fullWidth
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField 
              select 
              label="Payment Method" 
              value={form.paymentMethod} 
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              fullWidth
            >
              {paymentMethods.map((method) => <MenuItem key={method} value={method}>{method}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={addExpense}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <Add />}
              fullWidth
              sx={{ height: 56 }}
            >
              {submitting ? "Adding..." : "Add Expense"}
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterList />}
              fullWidth
              sx={{ height: 56 }}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Filters Section */}
      {showFilters && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" mb={2} fontWeight="semibold">Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                fullWidth
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" onClick={resetFilters} startIcon={<Refresh />}>
                Reset Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Export Buttons */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" color="success" onClick={handleExportCSV} startIcon={<Download />}>
          Export CSV
        </Button>
        <Button variant="contained" color="info" onClick={handlePrint} startIcon={<Print />}>
          Print Report
        </Button>
        <Button variant="outlined" onClick={loadExpenses} startIcon={<Refresh />}>
          Refresh
        </Button>
      </Paper>

      {/* Expenses List Table */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" mb={2} fontWeight="semibold">
          Expenses List
          {summary && (
            <Chip 
              label={`Total: LKR ${summary.totalAmount?.toLocaleString() || 0}`} 
              size="small" 
              color="primary" 
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Invoice No</TableCell>
                  <TableCell align="right">Amount (LKR)</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Entered By</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <TableRow key={expense._id} hover>
                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={expense.category} 
                          size="small" 
                          sx={{ bgcolor: getCategoryColor(expense.category), color: "#fff" }}
                        />
                      </TableCell>
                      <TableCell>{expense.subject}</TableCell>
                      <TableCell>{expense.invoiceNo}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          LKR {expense.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>{expense.paymentMethod}</TableCell>
                      <TableCell>{expense.enteredBy?.fullName || "Unknown"}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => openEditDialog(expense)}
                          title="Edit"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => deleteExpense(expense._id)}
                          title="Delete"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">No expenses found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Edit Expense Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Expense
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setEditDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Category"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                fullWidth
              >
                {categories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Subject"
                value={editForm.subject}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Invoice No"
                value={editForm.invoiceNo}
                onChange={(e) => setEditForm({ ...editForm, invoiceNo: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount (LKR)"
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Payment Method"
                value={editForm.paymentMethod}
                onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                fullWidth
              >
                {paymentMethods.map((method) => <MenuItem key={method} value={method}>{method}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={updateExpense} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}