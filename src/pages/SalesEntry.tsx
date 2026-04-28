import { useState } from 'react';
import Grid from '@mui/material/Grid';
import { Button, TextField, MenuItem } from '@mui/material';
import DataTable from '../components/common/DataTable';
import FormModal from '../components/common/FormModal';
import useSalesStore from '../stores/useSalesStore';
import useCustomerStore from '../stores/useCustomerStore';
import useProductStore from '../stores/useProductStore';
import { useForm } from 'react-hook-form';
import type { GridColDef } from '@mui/x-data-grid';
import type { Sale } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

const paymentTypes = ['Cash', 'Credit', 'Bank', 'Mobile'];

const columns: GridColDef[] = [
  { field: 'date', headerName: 'Date', width: 100 },
  { field: 'invoiceNo', headerName: 'Invoice No', width: 120 },
  { field: 'salesman', headerName: 'Salesman', width: 150 },
  { field: 'customer', headerName: 'Customer Name', width: 150 },
  { field: 'product', headerName: 'Product', width: 200 },
  { field: 'quantity', headerName: 'Quantity', width: 100 },
  { field: 'unitPrice', headerName: 'Unit Price', width: 100, valueFormatter: (v) => formatCurrency(v as number) },
  { field: 'total', headerName: 'Total Amount', width: 120, valueFormatter: (v) => formatCurrency(v as number) },
  { field: 'paymentType', headerName: 'Payment Type', width: 120 },
  { field: 'paid', headerName: 'Paid Amount', width: 120, valueFormatter: (v) => formatCurrency(v as number) },
  { field: 'balance', headerName: 'Balance', width: 100, valueFormatter: (v) => formatCurrency(v as number) },
];

export default function SalesEntry() {
  const { sales, addSale, updateSale, deleteSale } = useSalesStore();
  const { customers } = useCustomerStore();
  const { products } = useProductStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, reset, watch } = useForm();

  const quantity = watch('quantity', 0);
  const unitPrice = watch('unitPrice', 0);
  const paid = watch('paid', 0);
  const total = quantity * unitPrice;
  const balance = total - paid;

  const onSubmit = (data: any) => {
    const sale = { ...data, total, balance };
    if (editingId) {
      updateSale(editingId, sale as Sale);
      setEditingId(null);
    } else {
      addSale(sale as Sale);
    }
    setOpen(false);
    reset();
  };

  const handleEdit = (id: string) => {
    const sale = sales.find((s) => s.id === id);
    reset(sale);
    setEditingId(id);
    setOpen(true);
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Button variant="contained" onClick={() => setOpen(true)}>+ Add Sale</Button>
      </Grid>
      <Grid size={12}>
        <DataTable rows={sales} columns={columns} onEdit={handleEdit} onDelete={deleteSale} />
      </Grid>
      <FormModal open={open} onClose={() => setOpen(false)} onSubmit={onSubmit} title="Add/Edit Sale">
        <TextField {...register('date')} label="Date" type="date" fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
        <TextField {...register('salesman')} label="Salesman Name" fullWidth sx={{ mb: 2 }} />
        <TextField {...register('customer')} select label="Customer Name" fullWidth sx={{ mb: 2 }}>
          {customers.map((cust) => <MenuItem key={cust.id} value={cust.name}>{cust.name}</MenuItem>)}
        </TextField>
        <TextField {...register('product')} select label="Product" fullWidth sx={{ mb: 2 }}>
          {products.map((prod) => <MenuItem key={prod.id} value={prod.name}>{prod.name}</MenuItem>)}
        </TextField>
        <TextField {...register('quantity', { valueAsNumber: true })} label="Quantity" type="number" fullWidth sx={{ mb: 2 }} />
        <TextField {...register('unitPrice', { valueAsNumber: true })} label="Unit Price" type="number" fullWidth sx={{ mb: 2 }} />
        <TextField label="Total Amount" value={total} disabled fullWidth sx={{ mb: 2 }} />
        <TextField {...register('paymentType')} select label="Payment Type" fullWidth sx={{ mb: 2 }}>
          {paymentTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
        </TextField>
        <TextField {...register('paid', { valueAsNumber: true })} label="Paid Amount" type="number" fullWidth sx={{ mb: 2 }} />
        <TextField label="Balance" value={balance} disabled fullWidth sx={{ mb: 2 }} />
      </FormModal>
    </Grid>
  );
}