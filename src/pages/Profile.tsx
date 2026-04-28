import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Visibility, VisibilityOff, Person, Lock, Phone, Badge, Save } from '@mui/icons-material';
import useAuthStore from '../stores/useAuthStore';

export default function Profile() {
  const { user, updateProfile, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    setSuccess('');

    if (!name.trim() || !username.trim()) {
      setLocalError('Name and username are required');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    const updates: { name: string; username: string; phone: string; newPassword?: string } = {
      name,
      username,
      phone,
    };

    if (newPassword) {
      updates.newPassword = newPassword;
    }

    const result = await updateProfile(updates);
    if (result) {
      setSuccess('Profile updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
          My Profile
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Update Your Details
            </Typography>

            {(error || localError) && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => { clearError(); setLocalError(''); }}>
                {error || localError}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
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
                disabled={isLoading}
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
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Change Password (leave blank to keep current)
              </Typography>

              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                sx={{ mb: 2 }}
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

              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                disabled={isLoading}
                sx={{ py: 1.5, fontWeight: 'bold' }}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ bgcolor: '#f5f5f5' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Account Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>User ID:</strong> {user?.id}
              </Typography>
              <Typography variant="body2">
                <strong>Role:</strong>{' '}
                <Box
                  component="span"
                  sx={{
                    bgcolor: user?.role === 'admin' ? '#4caf50' : '#ff9800',
                    color: 'white',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  {user?.role}
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {user?.role === 'salesman'
                  ? 'You can update your name, username, phone, and password.'
                  : 'As an admin, you can manage salesmen accounts.'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
