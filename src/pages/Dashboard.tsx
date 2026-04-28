import Grid from '@mui/material/Grid';
import { Alert, Paper, Typography, Chip, Button, Box } from '@mui/material';
import { Person, PersonAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SummaryCard from '../components/common/SummaryCard';
import DataTable from '../components/common/DataTable';
import useProductStore from '../stores/useProductStore';
import useInventoryStore from '../stores/useInventoryStore';
import useAuthStore from '../stores/useAuthStore';
import type { GridColDef } from '@mui/x-data-grid';
import { formatCurrency } from '../utils/formatCurrency';
import type { InventoryItem } from '../types';

export default function Dashboard() {
  const { products } = useProductStore();
  const { items } = useInventoryStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const totalSales = formatCurrency(104.46);
  const todaysSales = formatCurrency(44.42);
  const lowStock = items.filter((i: InventoryItem) => i.stock <= i.reorderLvl).length;
  const totalItems = products.length;

  const productColumns: GridColDef[] = [
    { field: 'name', headerName: 'Product Name', width: 150 },
    { field: 'category', headerName: 'Category', width: 120 },
    { field: 'unit', headerName: 'Unit', width: 100 },
    { field: 'shelfLife', headerName: 'Shelf Life (Days)', width: 130 },
    { field: 'status', headerName: 'Status', width: 100 },
  ];

  return (
    <Grid container spacing={3}>
      {/* User Info Banner */}
      <Grid size={12}>
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#1976d2', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Person />
            <Typography variant="h6">Welcome, {user?.name}</Typography>
            <Chip
              label={`ID: ${user?.id}`}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
            />
            <Chip
              label={user?.role?.toUpperCase()}
              sx={{ bgcolor: user?.role === 'admin' ? '#4caf50' : '#ff9800', color: 'white' }}
            />
          </Box>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/salesmen')}
              sx={{
                bgcolor: 'white',
                color: '#1976d2',
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#f5f5f5' },
              }}
            >
              Add Salesman
            </Button>
          )}
        </Paper>
      </Grid>
      <Grid size={12}>
        <Alert severity="info">{lowStock} Products Below Threshold</Alert>
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Total Sales" value={totalSales} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Today's Sales" value={todaysSales} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Low Stock" value={lowStock.toString()} />
      </Grid>
      <Grid size={3}>
        <SummaryCard title="Total Items" value={totalItems.toString()} />
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" sx={{ mb: 2 }}>Items in Master</Typography>
        <DataTable rows={products} columns={productColumns} onEdit={() => {}} onDelete={() => {}} />
      </Grid>
    </Grid>
  );
}
