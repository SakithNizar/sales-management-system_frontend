import { useEffect, useState } from "react";
import { Box, Button, MenuItem, Paper, TextField, Typography } from "@mui/material";
import DataTable from "../components/common/DataTable";
import { apiRequest } from "../api/api";
import type { GridColDef } from "@mui/x-data-grid";

const categories = ["Raw Material", "Packaging", "Transport", "Utility", "Maintenance", "Labour", "Office Expense", "Other"];

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>({});
  const [form, setForm] = useState({
    date: "",
    category: "Packaging",
    subject: "",
    invoiceNo: "",
    amount: 0,
    paymentMethod: "Cash",
    enteredBy: "",
  });

  const loadExpenses = async () => {
    setExpenses(await apiRequest("/expenses"));
    setTotals(await apiRequest("/expenses/totals"));
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const addExpense = async () => {
    await apiRequest("/expenses", {
      method: "POST",
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    loadExpenses();
  };

  const deleteExpense = async (id: string) => {
    await apiRequest(`/expenses/${id}`, { method: "DELETE" });
    loadExpenses();
  };

  const columns: GridColDef[] = [
    { field: "date", headerName: "Date", width: 130 },
    { field: "category", headerName: "Category", width: 150 },
    { field: "subject", headerName: "Subject", width: 200 },
    { field: "invoiceNo", headerName: "Invoice No", width: 140 },
    { field: "amount", headerName: "Amount", width: 130 },
    { field: "paymentMethod", headerName: "Payment", width: 130 },
    { field: "enteredBy", headerName: "Entered By", width: 150 },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>Expenses</Typography>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>Add New Expense</Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
          <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />

          <TextField select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
          </TextField>

          <TextField label="Subject / Purchase Name" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <TextField label="Invoice No" value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} />
          <TextField label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />

          <TextField select label="Payment Method" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Bank">Bank</MenuItem>
            <MenuItem value="Card">Card</MenuItem>
          </TextField>

          <TextField label="Entered By" value={form.enteredBy} onChange={(e) => setForm({ ...form, enteredBy: e.target.value })} />
        </Box>

        <Button sx={{ mt: 2 }} variant="contained" color="error" onClick={addExpense}>Add Expense</Button>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>Expense Totals</Typography>
        <Typography>Today: LKR {totals.today || 0}</Typography>
        <Typography>This Month: LKR {totals.thisMonth || 0}</Typography>
        <Typography>This Year: LKR {totals.thisYear || 0}</Typography>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>Expenses List</Typography>
        <DataTable rows={expenses} columns={columns} onDelete={deleteExpense} />
      </Paper>
    </Box>
  );
}