import { useEffect, useState } from "react";
import { Box, Button, MenuItem, Paper, TextField, Typography } from "@mui/material";
import DataTable from "../components/common/DataTable";
import { apiRequest } from "../api/api";
import type { GridColDef } from "@mui/x-data-grid";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    email: "",
    phoneNumber: "",
    role: "salesman",
    status: "active",
    assignedRoutes: "",
  });

  const loadUsers = async () => setUsers(await apiRequest("/users"));

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async () => {
    await apiRequest("/users", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        assignedRoutes: form.assignedRoutes.split(",").map((r) => r.trim()).filter(Boolean),
      }),
    });
    setForm({ fullName: "", username: "", password: "", email: "", phoneNumber: "", role: "salesman", status: "active", assignedRoutes: "" });
    loadUsers();
  };

  const deleteUser = async (id: string) => {
    await apiRequest(`/users/${id}`, { method: "DELETE" });
    loadUsers();
  };

  const columns: GridColDef[] = [
    { field: "fullName", headerName: "Full Name", width: 180 },
    { field: "username", headerName: "Username", width: 140 },
    { field: "role", headerName: "Role", width: 160 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "phoneNumber", headerName: "Phone", width: 150 },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>User Management</Typography>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>Create User</Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
          <TextField label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <TextField label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Phone Number" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />

          <TextField select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="salesman">Salesman</MenuItem>
            <MenuItem value="production_manager">Production Manager</MenuItem>
            <MenuItem value="store_manager">Store Manager</MenuItem>
          </TextField>

          <TextField label="Assigned Routes" placeholder="Kandy Road, Colombo 07" value={form.assignedRoutes} onChange={(e) => setForm({ ...form, assignedRoutes: e.target.value })} />
        </Box>

        <Button sx={{ mt: 2 }} variant="contained" onClick={createUser}>Create User</Button>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>All Users</Typography>
        <DataTable rows={users} columns={columns} onDelete={deleteUser} />
      </Paper>
    </Box>
  );
}