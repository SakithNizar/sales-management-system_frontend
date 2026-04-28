import { useState, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import { Button, Alert, TextField, MenuItem, Typography } from '@mui/material';
import SummaryCard from '../components/common/SummaryCard';
import DataTable from '../components/common/DataTable';
import FormModal from '../components/common/FormModal';
import useProductionStore from '../stores/useProductionStore';
import useProductStore from '../stores/useProductStore';
import { useForm, Controller } from 'react-hook-form';
import type { GridColDef } from '@mui/x-data-grid';
import { formatCurrency } from '../utils/formatCurrency';
import { exportToExcel } from '../utils/exportToExcel';
import type { ProductionBatch, Product } from '../types';

const columns: GridColDef[] = [
  { field: 'batchNo', headerName: 'Batch No', width: 110 },
  { field: 'invoiceNo', headerName: 'Invoice No', width: 110 },
  { field: 'date', headerName: 'Date', width: 100 },
  { field: 'product', headerName: 'Product', width: 180 },
  { field: 'quantity', headerName: 'Qty', width: 80 },
  { field: 'unitCost', headerName: 'Unit Cost', width: 110, valueFormatter: (value: number) => formatCurrency(value) },
  { field: 'totalCost', headerName: 'Total Cost', width: 120, valueFormatter: (value: number) => formatCurrency(value) },
  { field: 'expiryDate', headerName: 'Expiry Date', width: 110 },
  { field: 'status', headerName: 'Status', width: 100 },
];

interface ProductionFormData {
  date: string;
  product: string;
  quantity: number;
  unitCost: number;
  notes: string;
}

export default function Production() {
  const { batches, addBatch, updateBatch, deleteBatch } = useProductionStore();
  const { products } = useProductStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, reset, handleSubmit, control, watch } = useForm<ProductionFormData>();
  const selectedProduct = watch('product');

  // Get only finished goods
  const finishedGoods = useMemo(() => {
    return products.filter((p: Product) => p.category === 'Finished Good');
  }, [products]);

  // Calculate expiry date based on selected product's shelf life
  const calculateExpiryDate = (productName: string, date: string) => {
    const product = products.find((p: Product) => p.name === productName);
    if (!product || !date) return '';
    
    const startDate = new Date(date);
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + product.shelfLife);
    return expiryDate.toISOString().split('T')[0];
  };

  const onSubmit = (data: ProductionFormData) => {
    const selectedProductObj = products.find((p: Product) => p.name === data.product);
    const expiryDate = calculateExpiryDate(data.product, data.date);
    const invoiceNo = `PR-${String(batches.length + 1).padStart(3, '0')}`;

    const batch: ProductionBatch = {
      id: editingId || Date.now().toString(),
      date: data.date,
      product: data.product,
      quantity: data.quantity,
      unitCost: data.unitCost,
      totalCost: data.quantity * data.unitCost,
      expiryDate,
      invoiceNo: editingId ? batches.find(b => b.id === editingId)?.invoiceNo || invoiceNo : invoiceNo,
      batchNo: editingId ? batches.find(b => b.id === editingId)?.batchNo || '' : `BATCH-${Date.now()}`,
      status: 'Produced',
      notes: data.notes,
    };

    if (editingId) {
      updateBatch(editingId, batch);
      setEditingId(null);
    } else {
      addBatch(batch);
    }
    setOpen(false);
    reset();
  };

  const handleEdit = (id: string) => {
    const batch = batches.find((b: ProductionBatch) => b.id === id);
    if (batch) {
      reset({
        date: batch.date,
        product: batch.product,
        quantity: batch.quantity,
        unitCost: batch.unitCost,
        notes: batch.notes,
      });
      setEditingId(id);
      setOpen(true);
    }
  };

  const handleAddNew = () => {
    reset({
      date: new Date().toISOString().split('T')[0],
      product: '',
      quantity: 0,
      unitCost: 0,
      notes: '',
    });
    setEditingId(null);
    setOpen(true);
  };

  const todayQty = batches.reduce((sum: number, b: ProductionBatch) => sum + b.quantity, 0);
  const totalCost = formatCurrency(batches.reduce((sum: number, b: ProductionBatch) => sum + b.totalCost, 0));
  const monthlyBatches = batches.length;

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Production Management</Typography>
      </Grid>
      <Grid size={12}>
        {finishedGoods.length === 0 && (
          <Alert severity="info">Please create Finished Goods items first before creating production batches.</Alert>
        )}
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Total Qty" value={todayQty.toString()} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Total Cost" value={totalCost} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Monthly Batches" value={monthlyBatches.toString()} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Finished Items" value={finishedGoods.length.toString()} />
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Use Finished Goods in Production</Typography>
        <Button variant="contained" onClick={handleAddNew} disabled={finishedGoods.length === 0} sx={{ mr: 1 }}>
          + Create Batch
        </Button>
        <Button onClick={() => exportToExcel('Production', batches)} variant="outlined">
          Export CSV
        </Button>
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Production List</Typography>
        <DataTable rows={batches} columns={columns} onEdit={handleEdit} onDelete={deleteBatch} />
      </Grid>
      <FormModal 
        open={open} 
        onClose={() => setOpen(false)} 
        onSubmit={handleSubmit(onSubmit)} 
        title={editingId ? "Edit Production Batch" : "Create Production Batch"}
      >
        <TextField 
          {...register('date')} 
          label="Date" 
          type="date" 
          fullWidth 
          sx={{ mb: 2 }} 
          InputLabelProps={{ shrink: true }}
        />
        <TextField 
          {...register('product')} 
          select 
          label="Product (Finished Goods)" 
          fullWidth 
          sx={{ mb: 2 }}
        >
          {finishedGoods.map((prod: Product) => (
            <MenuItem key={prod.id} value={prod.name}>
              {prod.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField 
          {...register('quantity', { valueAsNumber: true })} 
          label="Quantity" 
          type="number" 
          fullWidth 
          sx={{ mb: 2 }}
        />
        <TextField 
          {...register('unitCost', { valueAsNumber: true })} 
          label="Unit Cost" 
          type="number" 
          fullWidth 
          sx={{ mb: 2 }}
        />
        <TextField 
          label="Expiry Date (Auto-calculated)"
          value={selectedProduct ? calculateExpiryDate(selectedProduct, watch('date')) : ''}
          disabled
          type="date"
          fullWidth 
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField 
          {...register('notes')} 
          label="Notes" 
          multiline 
          rows={3}
          fullWidth 
          sx={{ mb: 2 }}
        />
      </FormModal>
    </Grid>
  );
}
