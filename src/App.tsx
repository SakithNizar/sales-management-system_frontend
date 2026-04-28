import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, Box, Toolbar } from '@mui/material';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Production from './pages/Production';
import Salary from './pages/Salary';
import Accounts from './pages/Accounts';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import SalesEntry from './pages/SalesEntry';
import ItemManagement from './pages/ItemManagement';
import SalesmanManagement from './pages/SalesManagement';
import ExpiryManagement from './pages/ExpiryManagement';
import Profile from './pages/Profile';
import useAuthStore from './stores/useAuthStore';
import UserManagement from './pages/UserManagement';
import RouteManagement from './pages/RouteManagement';
import Store from './pages/Store';

const theme = createTheme({
  palette: { primary: { main: '#1976d2' }, background: { default: '#f4f6f8' } },
});

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          backgroundColor: '#f4f6f8',
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute requiredRole="admin"><AppLayout><Expenses /></AppLayout></ProtectedRoute>} />
          <Route path="/production" element={<ProtectedRoute requiredRole="admin"><AppLayout><Production /></AppLayout></ProtectedRoute>} />
          <Route path="/salary" element={<ProtectedRoute requiredRole="admin"><AppLayout><Salary /></AppLayout></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute requiredRole="admin"><AppLayout><Accounts /></AppLayout></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute requiredRole="admin"><AppLayout><Inventory /></AppLayout></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><AppLayout><Customers /></AppLayout></ProtectedRoute>} />
          <Route path="/sales-entry" element={<ProtectedRoute><AppLayout><SalesEntry /></AppLayout></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><AppLayout><ItemManagement /></AppLayout></ProtectedRoute>} />
          <Route path="/salesmen" element={<ProtectedRoute requiredRole="admin"><AppLayout><SalesmanManagement /></AppLayout></ProtectedRoute>} />
          <Route path="/expiry" element={<ProtectedRoute requiredRole="admin"><AppLayout><ExpiryManagement /></AppLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute requiredRole="admin"><AppLayout><SalesEntry /></AppLayout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute requiredRole="admin"><AppLayout><UserManagement /></AppLayout></ProtectedRoute>} />
          <Route path="/routes" element={<ProtectedRoute requiredRole="admin"><AppLayout><RouteManagement /></AppLayout></ProtectedRoute>} />
          <Route path="/items" element={<ProtectedRoute requiredRole="admin"><AppLayout><ItemManagement /></AppLayout></ProtectedRoute>} />
          <Route path="/store" element={<ProtectedRoute requiredRole="admin"><AppLayout><Store /></AppLayout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;