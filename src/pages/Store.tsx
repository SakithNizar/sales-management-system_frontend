import { useEffect, useState } from "react";
import { Box, Button, MenuItem, Paper, TextField, Typography } from "@mui/material";
import DataTable from "../components/common/DataTable";
import { apiRequest } from "../api/api";
import type { GridColDef } from "@mui/x-data-grid";

export default function Store() {
  const [items, setItems] = useState<any[]>([]);
  const [stockIn, setStockIn] = useState<any[]>([]);
  const [stockOut, setStockOut] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);

  const [inForm, setInForm] = useState({
    itemId: "",
    batchNo: "",
    quantity: 0,
    unitCost: 0,
    expiryDate: "",
    source: "Purchase",
    manager: "",
    remarks: "",
  });

  const [outForm, setOutForm] = useState({
    itemId: "",
    batchNo: "",
    quantity: 0,
    unitCost: 0,
    manager: "",
    remarks: "",
  });

  const loadData = async () => {
    setItems(await apiRequest("/items"));
    setStockIn(await apiRequest("/stock-in"));
    setStockOut(await apiRequest("/stock-out"));
    setSummary(await apiRequest("/dashboard/stock-summary"));
  };

  useEffect(() => {
    loadData();
  }, []);

  const createStockIn = async () => {
    await apiRequest("/stock-in", {
      method: "POST",
      body: JSON.stringify({
        ...inForm,
        quantity: Number(inForm.quantity),
        unitCost: Number(inForm.unitCost),
      }),
    });
    loadData();
  };

  const createStockOut = async () => {
    await apiRequest("/stock-out", {
      method: "POST",
      body: JSON.stringify({
        ...outForm,
        quantity: Number(outForm.quantity),
        unitCost: Number(outForm.unitCost),
      }),
    });
    loadData();
  };

  const stockInColumns: GridColDef[] = [
    { field: "date", headerName: "Date", width: 130 },
    { field: "invoiceNo", headerName: "Invoice No", width: 140 },
    { field: "itemName", headerName: "Item Name", width: 180 },
    { field: "quantity", headerName: "Qty", width: 90 },
    { field: "unitCost", headerName: "Unit Cost", width: 120 },
    { field: "totalCost", headerName: "Total", width: 130 },
    { field: "manager", headerName: "Manager", width: 150 },
  ];

  const stockOutColumns: GridColDef[] = [
    { field: "date", headerName: "Date", width: 130 },
    { field: "invoiceNo", headerName: "Invoice No", width: 140 },
    { field: "itemName", headerName: "Item Name", width: 180 },
    { field: "batchNo", headerName: "Batch No", width: 130 },
    { field: "quantity", headerName: "Qty Out", width: 100 },
    { field: "unitCost", headerName: "Unit Cost", width: 120 },
    { field: "totalCost", headerName: "Total", width: 130 },
  ];

  const summaryColumns: GridColDef[] = [
    { field: "itemName", headerName: "Item Name", width: 200 },
    { field: "unit", headerName: "Unit", width: 100 },
    { field: "totalIn", headerName: "Total IN", width: 120 },
    { field: "totalOut", headerName: "Total OUT", width: 120 },
    { field: "available", headerName: "Available", width: 120 },
    { field: "minimumLevel", headerName: "Min Level", width: 120 },
    { field: "status", headerName: "Status", width: 130 },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>Store Module</Typography>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>Stock IN</Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
          <TextField select label="Select Product" value={inForm.itemId} onChange={(e) => setInForm({ ...inForm, itemId: e.target.value })}>
            {items.map((item) => (
              <MenuItem key={item.id || item._id} value={item.id || item._id}>
                {item.itemName} ({item.unit})
              </MenuItem>
            ))}
          </TextField>

          <TextField label="Batch No" value={inForm.batchNo} onChange={(e) => setInForm({ ...inForm, batchNo: e.target.value })} />
          <TextField label="Quantity" type="number" value={inForm.quantity} onChange={(e) => setInForm({ ...inForm, quantity: Number(e.target.value) })} />
          <TextField label="Unit Cost" type="number" value={inForm.unitCost} onChange={(e) => setInForm({ ...inForm, unitCost: Number(e.target.value) })} />
          <TextField label="Expiry Date" type="date" InputLabelProps={{ shrink: true }} value={inForm.expiryDate} onChange={(e) => setInForm({ ...inForm, expiryDate: e.target.value })} />
          <TextField label="Manager" value={inForm.manager} onChange={(e) => setInForm({ ...inForm, manager: e.target.value })} />
        </Box>

        <Button sx={{ mt: 2 }} variant="contained" onClick={createStockIn}>Record Stock IN</Button>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>Stock OUT</Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
          <TextField select label="Select Product" value={outForm.itemId} onChange={(e) => setOutForm({ ...outForm, itemId: e.target.value })}>
            {items.map((item) => (
              <MenuItem key={item.id || item._id} value={item.id || item._id}>
                {item.itemName} ({item.unit})
              </MenuItem>
            ))}
          </TextField>

          <TextField label="Batch No" value={outForm.batchNo} onChange={(e) => setOutForm({ ...outForm, batchNo: e.target.value })} />
          <TextField label="Quantity" type="number" value={outForm.quantity} onChange={(e) => setOutForm({ ...outForm, quantity: Number(e.target.value) })} />
          <TextField label="Unit Cost" type="number" value={outForm.unitCost} onChange={(e) => setOutForm({ ...outForm, unitCost: Number(e.target.value) })} />
          <TextField label="Manager" value={outForm.manager} onChange={(e) => setOutForm({ ...outForm, manager: e.target.value })} />
        </Box>

        <Button sx={{ mt: 2 }} variant="contained" onClick={createStockOut}>Record Stock OUT</Button>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>Stock IN List</Typography>
        <DataTable rows={stockIn} columns={stockInColumns} />
      </Paper>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>Stock OUT Records</Typography>
        <DataTable rows={stockOut} columns={stockOutColumns} />
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>Dashboard Stock Summary</Typography>
        <DataTable rows={summary} columns={summaryColumns} />
      </Paper>
    </Box>
  );
}