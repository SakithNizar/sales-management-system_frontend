import { AppBar, Toolbar, Typography, IconButton, Chip, Box, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <AppBar 
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Ceylon Dairy Fresh
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<PersonIcon />}
              onClick={handleProfile}
              sx={{ textTransform: 'none' }}
            >
              {user.name}
            </Button>
            <Chip
              label={user.role.toUpperCase()}
              size="small"
              sx={{
                bgcolor: user.role === 'admin' ? '#4caf50' : '#ff9800',
                color: 'white',
                fontWeight: 'bold',
                mr: 1,
              }}
            />
            <IconButton color="inherit" onClick={handleLogout} title="Logout">
              <LogoutIcon />
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}