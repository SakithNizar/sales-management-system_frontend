import { useState } from 'react';
import Grid from '@mui/material/Grid';
import { Button, TextField, Typography } from '@mui/material';
import SummaryCard from '../components/common/SummaryCard';
import DataTable from '../components/common/DataTable';
import FormModal from '../components/common/FormModal';
import useSalaryStore from '../stores/useSalaryStore';
import { useForm } from 'react-hook-form';
import type { GridColDef } from '@mui/x-data-grid';
import type { Salary, Advance } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

const salaryColumns: GridColDef[] = [
  { field: 'staffName', headerName: 'Staff', width: 150 },
  { field: 'role', headerName: 'Role', width: 150 },
  { field: 'basic', headerName: 'Base', width: 100, valueFormatter: (v) => formatCurrency(v as number) },
  { field: 'advance', headerName: 'Advance', width: 100, valueFormatter: (v) => formatCurrency(v as number) },
  { field: 'bonus', headerName: 'Bonus', width: 100, valueFormatter: (v) => formatCurrency(v as number) },
  { field: 'deduct', headerName: 'Deduct', width: 100, valueFormatter: (v) => formatCurrency(v as number) },
  { field: 'paid', headerName: 'Paid', width: 100, valueFormatter: (v) => formatCurrency(v as number) },
  { field: 'balance', headerName: 'Balance', width: 100, valueFormatter: (v) => formatCurrency(v as number) },
  { field: 'status', headerName: 'Status', width: 100 },
];

const advanceColumns: GridColDef[] = [
  { field: 'date', headerName: 'Date', width: 100 },
  { field: 'staffName', headerName: 'Staff', width: 150 },
  { field: 'amount', headerName: 'Amount', width: 100, valueFormatter: (v) => formatCurrency(v as number) },
  { field: 'reason', headerName: 'Reason', width: 200 },
  { field: 'approvedBy', headerName: 'Approved By', width: 120 },
];

export default function Salary() {
  const { salaries, advances, addSalary, addAdvance } = useSalaryStore();
  const [openSalary, setOpenSalary] = useState(false);
  const [openAdvance, setOpenAdvance] = useState(false);

  const { register: regSalary, handleSubmit: _subSalary } = useForm();
  const { register: regAdvance, handleSubmit: _subAdvance } = useForm();

  const onAddSalary = (data: any) => {
    addSalary(data as Salary);
    setOpenSalary(false);
  };

  const onAddAdvance = (data: any) => {
    addAdvance(data as Advance);
    setOpenAdvance(false);
  };

  const totalSalary = formatCurrency(355000);
  const totalAdvance = formatCurrency(38000);
  const totalPaid = formatCurrency(247500);
  const pendingBalance = formatCurrency(65500);

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Salary Management</Typography>
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Total Salary" value={totalSalary} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Total Advance" value={totalAdvance} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Total Paid" value={totalPaid} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Pending Balance" value={pendingBalance} />
      </Grid>
      <Grid size={12}>
        <Button variant="contained" onClick={() => setOpenSalary(true)} sx={{ mr: 1 }}>+ Process Salary</Button>
        <Button variant="outlined" onClick={() => setOpenAdvance(true)} sx={{ mr: 1 }}>+ Record Advance</Button>
        <Button variant="outlined" sx={{ mr: 1 }}>Print</Button>
        <Button variant="outlined">Export CSV</Button>
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Salary Payments</Typography>
        <DataTable rows={salaries} columns={salaryColumns} onEdit={() => {}} onDelete={() => {}} />
      </Grid>
      <FormModal open={openSalary} onClose={() => setOpenSalary(false)} onSubmit={onAddSalary} title="Process Salary">
        {/* Add fields for salary form */}
        <TextField {...regSalary('staffName')} label="Staff Name" fullWidth sx={{ mb: 2 }} />
        {/* ... other fields from screenshot */}
      </FormModal>
      <FormModal open={openAdvance} onClose={() => setOpenAdvance(false)} onSubmit={onAddAdvance} title="Record Advance">
        <TextField {...regAdvance('staffName')} label="Staff Name" fullWidth sx={{ mb: 2 }} />
        <TextField {...regAdvance('date')} label="Date" type="date" fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
        <TextField {...regAdvance('amount', { valueAsNumber: true })} label="Amount" type="number" fullWidth sx={{ mb: 2 }} />
        <TextField {...regAdvance('reason')} label="Reason" fullWidth sx={{ mb: 2 }} />
        <TextField {...regAdvance('approvedBy')} label="Approved By" fullWidth sx={{ mb: 2 }} />
      </FormModal>
    </Grid>
  );
}