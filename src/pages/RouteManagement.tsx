import { useEffect, useState } from "react";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import DataTable from "../components/common/DataTable";
import { apiRequest } from "../api/api";
import type { GridColDef } from "@mui/x-data-grid";

export default function RouteManagement() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [form, setForm] = useState({ routeName: "", city: "" });

  const loadRoutes = async () => setRoutes(await apiRequest("/routes"));

  useEffect(() => {
    loadRoutes();
  }, []);

  const createRoute = async () => {
    await apiRequest("/routes", {
      method: "POST",
      body: JSON.stringify(form),
    });
    setForm({ routeName: "", city: "" });
    loadRoutes();
  };

  const deleteRoute = async (id: string) => {
    await apiRequest(`/routes/${id}`, { method: "DELETE" });
    loadRoutes();
  };

  const columns: GridColDef[] = [
    { field: "routeName", headerName: "Route Name", width: 220 },
    { field: "city", headerName: "City", width: 180 },
    { field: "createdAt", headerName: "Created At", width: 200 },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>Route Management</Typography>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>Create Route</Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
          <TextField label="Route Name" value={form.routeName} onChange={(e) => setForm({ ...form, routeName: e.target.value })} />
          <TextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </Box>

        <Button sx={{ mt: 2 }} variant="contained" color="success" onClick={createRoute}>
          Create Route
        </Button>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>All Routes</Typography>
        <DataTable rows={routes} columns={columns} onDelete={deleteRoute} />
      </Paper>
    </Box>
  );
}