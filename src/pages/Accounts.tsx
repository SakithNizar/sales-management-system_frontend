import { useState } from 'react';
import Grid from '@mui/material/Grid';
import { Button, TextField, MenuItem, Typography } from '@mui/material';
import SummaryCard from '../components/common/SummaryCard';
import DataTable from '../components/common/DataTable';
import FormModal from '../components/common/FormModal';
import useAccountStore from '../stores/useAccountStore';
import { useForm } from 'react-hook-form';
import type { GridColDef } from '@mui/x-data-grid';
import { formatCurrency } from '../utils/formatCurrency';
import type { AccountEntry } from '../types';

const types = ['Income', 'Expense'];
const categoriesList = ['Sales', 'Raw Materials', 'Transport', 'Salary', 'Packaging', 'Utilities', 'Maintenance'];

const columns: GridColDef[] = [
  { field: 'date', headerName: 'Date', width: 100 },
  { field: 'invoiceNo', headerName: 'Invoice #', width: 120 },
  { field: 'description', headerName: 'Description', width: 200 },
  { field: 'type', headerName: 'Type', width: 100 },
  { field: 'category', headerName: 'Category', width: 120 },
  { field: 'income', headerName: 'Income', width: 100, valueFormatter: (value: number) => formatCurrency(value) },
  { field: 'expense', headerName: 'Expense', width: 100, valueFormatter: (value: number) => formatCurrency(value) },
  { field: 'balance', headerName: 'Balance', width: 100, valueFormatter: (value: number) => formatCurrency(value) },
];

export default function Accounts() {
  const { entries, addEntry, updateEntry, deleteEntry } = useAccountStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, reset } = useForm();

  const onSubmit = (data: Record<string, unknown>) => {
    const entry = {
      ...data,
      income: data.type === 'Income' ? data.amount : 0,
      expense: data.type === 'Expense' ? data.amount : 0,
    };
    if (editingId) {
      updateEntry(editingId, entry as unknown as AccountEntry);
      setEditingId(null);
    } else {
      addEntry(entry as unknown as AccountEntry);
    }
    setOpen(false);
    reset();
  };

  const handleEdit = (id: string) => {
    const entry = entries.find((e: AccountEntry) => e.id === id);
    reset(entry);
    setEditingId(id);
    setOpen(true);
  };

  const totalIncomeToday = formatCurrency(193000);
  const totalExpenseToday = formatCurrency(50500);
  const currentBalance = formatCurrency(241000);
  const monthlyProfit = formatCurrency(241000);

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Accounts & Ledger</Typography>
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Total Income Today" value={totalIncomeToday} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Total Expense Today" value={totalExpenseToday} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Current Balance" value={currentBalance} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Monthly Profit" value={monthlyProfit} />
      </Grid>
      <Grid size={12}>
        <Button variant="contained" onClick={() => setOpen(true)} sx={{ mr: 1 }}>+ New Entry</Button>
        <Button variant="outlined" sx={{ mr: 1 }}>Print</Button>
        <Button variant="outlined">Export CSV</Button>
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Ledger Entries</Typography>
        <DataTable rows={entries} columns={columns} onEdit={handleEdit} onDelete={deleteEntry} />
      </Grid>
      <FormModal open={open} onClose={() => setOpen(false)} onSubmit={onSubmit} title="New Ledger Entry">
        <TextField {...register('type')} select label="Entry Type" fullWidth sx={{ mb: 2 }}>
          {types.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
        </TextField>
        <TextField {...register('date')} label="Date" type="date" fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
        <TextField {...register('invoiceNo')} label="Invoice #" fullWidth sx={{ mb: 2 }} />
        <TextField {...register('category')} select label="Category" fullWidth sx={{ mb: 2 }}>
          {categoriesList.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
        </TextField>
        <TextField {...register('amount', { valueAsNumber: true })} label="Amount (Rs.)" type="number" fullWidth sx={{ mb: 2 }} />
        <TextField {...register('description')} label="Description" fullWidth sx={{ mb: 2 }} />
      </FormModal>
    </Grid>
  );
}
