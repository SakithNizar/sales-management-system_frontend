import Grid from '@mui/material/Grid';
import { Alert, Button, ButtonGroup, Typography } from '@mui/material';
import DataTable from '../components/common/DataTable';
import useProductionStore from '../stores/useProductionStore';
import type { GridColDef } from '@mui/x-data-grid';
import { calculateDaysLeft } from '../utils/calculateExpiryStatus';
import type { ProductionBatch } from '../types';

export default function ExpiryManagement() {
  const { batches } = useProductionStore();

  const columns: GridColDef[] = [
    { field: 'product', headerName: 'Product', width: 150 },
    { field: 'batchNo', headerName: 'Batch No', width: 120 },
    { field: 'date', headerName: 'Production Date', width: 120 },
    { field: 'expiryDate', headerName: 'Expiry Date', width: 120 },
    { field: 'quantity', headerName: 'Qty', width: 100 },
    { field: 'status', headerName: 'Status', width: 100 },
  ];

  const expired = batches.filter((b: ProductionBatch) => calculateDaysLeft(b.expiryDate) === 'Expired').length;
  const expiringSoon = batches.filter((b: ProductionBatch) => calculateDaysLeft(b.expiryDate) === 'Expiring Soon').length;

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Expiry Management</Typography>
      </Grid>
      <Grid size={12}>
        <Alert severity="error">{expired} batch(es) expired. These batches have expired and should be removed from inventory immediately.</Alert>
      </Grid>
      <Grid size={12}>
        <ButtonGroup>
          <Button>Expired ({expired})</Button>
          <Button>Expiring Soon ({expiringSoon})</Button>
          <Button>Active ({batches.length - expired - expiringSoon})</Button>
        </ButtonGroup>
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Production Batches</Typography>
        <DataTable rows={batches} columns={columns} onEdit={() => {}} onDelete={() => {}} />
      </Grid>
    </Grid>
  );
}
