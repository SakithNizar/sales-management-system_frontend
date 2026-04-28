import { useState } from 'react';
import Grid from '@mui/material/Grid';
import { Button, Alert, TextField, MenuItem } from '@mui/material';
import SummaryCard from '../components/common/SummaryCard';
import DataTable from '../components/common/DataTable';
import FormModal from '../components/common/FormModal';
import useCustomerStore from '../stores/useCustomerStore';
import { useForm } from 'react-hook-form';
import type { GridColDef } from '@mui/x-data-grid';
import { formatCurrency } from '../utils/formatCurrency';
import type { Customer } from '../types';

const routes = ['South Route', 'Central Route', 'North Route', 'West Route'];

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Customer', width: 150 },
  { field: 'route', headerName: 'Route', width: 120 },
  { field: 'creditLimit', headerName: 'Credit Limit', width: 120, valueFormatter: (value: number) => formatCurrency(value) },
  { field: 'outstanding', headerName: 'Outstanding', width: 120, valueFormatter: (value: number) => formatCurrency(value) },
  { field: 'status', headerName: 'Status', width: 100 },
  { field: 'joined', headerName: 'Joined', width: 120 },
];

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, reset } = useForm();

  const onSubmit = (data: Record<string, unknown>) => {
    if (editingId) {
      updateCustomer(editingId, data as unknown as Customer);
      setEditingId(null);
    } else {
      addCustomer(data as unknown as Customer);
    }
    setOpen(false);
    reset();
  };

  const handleEdit = (id: string) => {
    const customer = customers.find((c: Customer) => c.id === id);
    reset(customer);
    setEditingId(id);
    setOpen(true);
  };

  const totalCustomers = customers.length.toString();
  const active = customers.filter((c: Customer) => c.status === 'Active').length.toString();
  const totalOutstanding = formatCurrency(723000);
  const creditWarnings = '2';

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Alert severity="error">2 customers near or over credit limit!</Alert>
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Total Customers" value={totalCustomers} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Active" value={active} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Total Outstanding" value={totalOutstanding} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Credit Warnings" value={creditWarnings} />
      </Grid>
      <Grid size={12}>
        <Button variant="contained" onClick={() => setOpen(true)}>+ Add Customer</Button>
        <Button>Export CSV</Button>
        <Button>Print</Button>
      </Grid>
      <Grid size={12}>
        <DataTable rows={customers} columns={columns} onEdit={handleEdit} onDelete={deleteCustomer} />
      </Grid>
      <FormModal open={open} onClose={() => setOpen(false)} onSubmit={onSubmit} title="Add/Edit Customer">
        <TextField {...register('name')} label="Customer Name" fullWidth sx={{ mb: 2 }} />
        <TextField {...register('shopName')} label="Shop Name" fullWidth sx={{ mb: 2 }} />
        <TextField {...register('contact')} label="Contact Number" fullWidth sx={{ mb: 2 }} />
        <TextField {...register('whatsapp')} label="WhatsApp" fullWidth sx={{ mb: 2 }} />
        <TextField {...register('address')} label="Address" fullWidth sx={{ mb: 2 }} />
        <TextField {...register('location')} label="Location" fullWidth sx={{ mb: 2 }} />
        <TextField {...register('email')} label="Email" fullWidth sx={{ mb: 2 }} />
        <TextField {...register('route')} select label="Sales Route" fullWidth sx={{ mb: 2 }}>
          {routes.map((route) => <MenuItem key={route} value={route}>{route}</MenuItem>)}
        </TextField>
        <TextField {...register('creditLimit', { valueAsNumber: true })} label="Credit Limit" type="number" fullWidth sx={{ mb: 2 }} />
        <TextField {...register('status')} select label="Status" fullWidth sx={{ mb: 2 }}>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>
        <TextField {...register('notes')} label="Notes" multiline fullWidth sx={{ mb: 2 }} />
      </FormModal>
    </Grid>
  );
}
