import { useState } from 'react';
import Grid from '@mui/material/Grid';
import {
  Button,
  TextField,
  Alert,
  Card,
  CardContent,
  Typography,
  Box,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  People,
  PersonAdd,
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Badge,
  ArrowBack,
  Save,
} from '@mui/icons-material';
import { Navigate } from 'react-router-dom';
import DataTable from '../components/common/DataTable';
import useSalesmanStore from '../stores/useSalesmanStore';
import useAuthStore from '../stores/useAuthStore';
import type { GridColDef } from '@mui/x-data-grid';
import type { Salesman } from '../types';

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Full Name', width: 180 },
  { field: 'username', headerName: 'Username', width: 150 },
  { field: 'status', headerName: 'Status', width: 120 },
];

type ViewMode = 'menu' | 'view' | 'create';

export default function SalesmanManagement() {
  const { salesmen, addSalesman, deleteSalesman } = useSalesmanStore();
  const { user, addSalesman: addSalesmanToAuth } = useAuthStore();
  const [viewMode, setViewMode] = useState<ViewMode>('menu');

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const resetForm = () => {
    setName('');
    setUsername('');
    setPassword('');
    setSuccess('');
    setError('');
  };

  const handleCreate = () => {
    setError('');
    setSuccess('');

    if (!name.trim() || !username.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const newSalesman: Salesman = {
      id: Date.now().toString(),
      name: name.trim(),
      username: username.trim(),
      status: 'active',
    };

    // Add to salesman store for display
    addSalesman(newSalesman);

    // Add to auth store so they can login
    addSalesmanToAuth({
      name: name.trim(),
      username: username.trim(),
      password: password,
    });

    setSuccess(`Salesman "${name}" created successfully! They can now login with username: ${username}`);
    resetForm();
  };

  // Menu View
  if (viewMode === 'menu') {
    return (
      <Grid container spacing={3}>
        <Grid size={12}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
            Salesman Management
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
            }}
            onClick={() => setViewMode('view')}
          >
            <CardContent sx={{ textAlign: 'center', py: 5 }}>
              <People sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold">
                View Existing Salesmen
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                View and manage all registered salesmen
              </Typography>
              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                {salesmen.length} Salesmen
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
            }}
            onClick={() => { resetForm(); setViewMode('create'); }}
          >
            <CardContent sx={{ textAlign: 'center', py: 5 }}>
              <PersonAdd sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold">
                Create New Salesman
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Add a new salesman with login credentials
              </Typography>
              <Typography variant="h6" color="success.main" sx={{ mt: 2 }}>
                + Add New
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  // View Existing Salesmen
  if (viewMode === 'view') {
    return (
      <Grid container spacing={3}>
        <Grid size={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => setViewMode('menu')}
            >
              Back
            </Button>
            <Typography variant="h4" fontWeight="bold">
              Existing Salesmen
            </Typography>
          </Box>
        </Grid>
        <Grid size={12}>
          <Button
            variant="contained"
            color="success"
            startIcon={<PersonAdd />}
            onClick={() => { resetForm(); setViewMode('create'); }}
            sx={{ mb: 2 }}
          >
            Create New Salesman
          </Button>
        </Grid>
        <Grid size={12}>
          {salesmen.length === 0 ? (
            <Alert severity="info">No salesmen registered yet. Create your first salesman!</Alert>
          ) : (
            <DataTable
              rows={salesmen}
              columns={columns}
              onEdit={() => {}}
              onDelete={deleteSalesman}
            />
          )}
        </Grid>
      </Grid>
    );
  }

  // Create New Salesman
  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => setViewMode('menu')}
          >
            Back
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Create New Salesman
          </Typography>
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Salesman Credentials
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<Save />}
              onClick={handleCreate}
              fullWidth
              sx={{ py: 1.5, fontWeight: 'bold' }}
            >
              Create Salesman
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ bgcolor: '#f5f5f5' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Instructions
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>1.</strong> Enter the salesman's full name (this will be displayed when they login).
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>2.</strong> Create a unique username for the salesman to login.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>3.</strong> Set a password (minimum 6 characters).
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>4.</strong> Share the username and password with the salesman so they can login.
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              The salesman can change their password after logging in via their Profile page.
            </Alert>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
