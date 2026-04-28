import { useEffect, useState } from "react";
import { Box, Button, MenuItem, Paper, TextField, Typography } from "@mui/material";
import DataTable from "../components/common/DataTable";
import { apiRequest } from "../api/api";
import type { GridColDef } from "@mui/x-data-grid";

export default function ItemManagement() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    itemName: "",
    category: "Finished Good",
    unit: "",
    shelfLifeDays: 0,
    minimumLevel: 0,
    status: "ACTIVE",
  });

  const loadItems = async () => setItems(await apiRequest("/items"));

  useEffect(() => {
    loadItems();
  }, []);

  const createItem = async () => {
    const data = {
      ...form,
      hasBatch: form.category === "Finished Good",
      shelfLifeDays: form.category === "Finished Good" ? Number(form.shelfLifeDays) : 0,
      minimumLevel: Number(form.minimumLevel),
    };

    await apiRequest("/items", {
      method: "POST",
      body: JSON.stringify(data),
    });

    setForm({ itemName: "", category: "Finished Good", unit: "", shelfLifeDays: 0, minimumLevel: 0, status: "ACTIVE" });
    loadItems();
  };

  const deleteItem = async (id: string) => {
    await apiRequest(`/items/${id}`, { method: "DELETE" });
    loadItems();
  };

  const columns: GridColDef[] = [
    { field: "itemName", headerName: "Item Name", width: 200 },
    { field: "category", headerName: "Category", width: 160 },
    { field: "unit", headerName: "Unit", width: 100 },
    { field: "shelfLifeDays", headerName: "Shelf Life", width: 120 },
    { field: "hasBatch", headerName: "Has Batch", width: 120 },
    { field: "minimumLevel", headerName: "Min Level", width: 120 },
    { field: "status", headerName: "Status", width: 120 },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>Item Management</Typography>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>Create Item</Typography>

        <Typography sx={{ background: "#f3e8ff", p: 1.5, borderRadius: 2, mb: 2 }}>
          Auto Logic: Finished Good → hasBatch true. Raw Material → hasBatch false and shelfLifeDays 0.
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
          <TextField label="Item Name" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />

          <TextField select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <MenuItem value="Finished Good">Finished Good</MenuItem>
            <MenuItem value="Raw Material">Raw Material</MenuItem>
          </TextField>

          <TextField label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />

          <TextField
            label="Shelf Life Days"
            type="number"
            disabled={form.category === "Raw Material"}
            value={form.category === "Raw Material" ? 0 : form.shelfLifeDays}
            onChange={(e) => setForm({ ...form, shelfLifeDays: Number(e.target.value) })}
          />

          <TextField label="Minimum Level" type="number" value={form.minimumLevel} onChange={(e) => setForm({ ...form, minimumLevel: Number(e.target.value) })} />

          <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
          </TextField>
        </Box>

        <Button sx={{ mt: 2 }} variant="contained" onClick={createItem}>Create Item</Button>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>All Items</Typography>
        <DataTable rows={items} columns={columns} onDelete={deleteItem} />
      </Paper>
    </Box>
  );
}