import { useState } from 'react';
import Grid from '@mui/material/Grid';
import { Button, Alert, TextField, MenuItem, Typography } from '@mui/material';
import SummaryCard from '../components/common/SummaryCard';
import DataTable from '../components/common/DataTable';
import FormModal from '../components/common/FormModal';
import useInventoryStore from '../stores/useInventoryStore';
import { useForm } from 'react-hook-form';
import type { GridColDef } from '@mui/x-data-grid';
import type { InventoryItem } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

const categories = ['Liquid Dairy', 'Cultured Dairy', 'Cheese', 'Butter & Ghee', 'Frozen Dairy'];

const itemColumns: GridColDef[] = [
  { field: 'name', headerName: 'Item Name', width: 200 },
  { field: 'category', headerName: 'Category', width: 150 },
  { field: 'stock', headerName: 'Stock', width: 100 },
  { field: 'reorderLvl', headerName: 'Reorder Lvl', width: 120 },
  { field: 'unitPrice', headerName: 'Unit Price', width: 120, valueFormatter: (v) => formatCurrency(v as number) },
  { field: 'shelfLife', headerName: 'Shelf Life', width: 100 },
  { field: 'storageTemp', headerName: 'Storage Temp', width: 120 },
  { field: 'status', headerName: 'Status', width: 100 },
];

export default function Inventory() {
  const { items, addItem } = useInventoryStore();
  const [openItem, setOpenItem] = useState(false);
  const [_openIn, setOpenIn] = useState(false);
  const [_openOut, setOpenOut] = useState(false);

  const { register: regItem } = useForm();

  const onAddItem = (data: unknown) => {
    addItem(data as unknown as InventoryItem);
    setOpenItem(false);
  };

  const totalItems = items.length.toString();
  const lowStock = '3';
  const outOfStock = '0';
  const totalValue = formatCurrency(197350);

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Inventory Management</Typography>
      </Grid>
      <Grid size={12}>
        <Alert severity="warning">3 items below reorder level!</Alert>
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Total Items" value={totalItems} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Low Stock" value={lowStock} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Out of Stock" value={outOfStock} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Total Value" value={totalValue} />
      </Grid>
      <Grid size={12}>
        <Button variant="contained" onClick={() => setOpenItem(true)} sx={{ mr: 1 }}>+ Add Item</Button>
        <Button color="success" onClick={() => setOpenIn(true)} sx={{ mr: 1 }}>Stock IN</Button>
        <Button color="error" onClick={() => setOpenOut(true)} sx={{ mr: 1 }}>Stock OUT</Button>
        <Button variant="outlined" sx={{ mr: 1 }}>Export CSV</Button>
        <Button variant="outlined">Print</Button>
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Stock Items</Typography>
        <DataTable rows={items} columns={itemColumns} onEdit={() => {}} onDelete={() => {}} />
      </Grid>
      <FormModal open={openItem} onClose={() => setOpenItem(false)} onSubmit={onAddItem} title="Add New Item">
        <TextField {...regItem('name')} label="Item Name" fullWidth sx={{ mb: 2 }} />
        <TextField {...regItem('category')} select label="Category" fullWidth sx={{ mb: 2 }}>
          {categories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
        </TextField>
        <TextField {...regItem('unit')} label="Unit" fullWidth sx={{ mb: 2 }} />
        <TextField {...regItem('currentStock', { valueAsNumber: true })} label="Current Stock" type="number" fullWidth sx={{ mb: 2 }} />
        <TextField {...regItem('reorderLvl', { valueAsNumber: true })} label="Reorder Level" type="number" fullWidth sx={{ mb: 2 }} />
        <TextField {...regItem('unitPrice', { valueAsNumber: true })} label="Unit Price (Rs.)" type="number" fullWidth sx={{ mb: 2 }} />
        <TextField {...regItem('shelfLife', { valueAsNumber: true })} label="Shelf Life (days)" type="number" fullWidth sx={{ mb: 2 }} />
        <TextField {...regItem('storageTemp')} label="Storage Temp" fullWidth sx={{ mb: 2 }} />
      </FormModal>
      {/* Similar modals for Stock In and Out */}
    </Grid>
  );
}