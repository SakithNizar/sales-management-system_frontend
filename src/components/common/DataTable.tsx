import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Button } from "@mui/material";

interface DataTableProps {
  rows: any[];
  columns: GridColDef[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export default function DataTable({ rows, columns, onEdit, onDelete, onView }: DataTableProps) {
  const actionColumn: GridColDef = {
    field: "actions",
    headerName: "Actions",
    width: 220,
    renderCell: (params: GridRenderCellParams) => (
      <>
        {onView && <Button onClick={() => onView(params.row.id)}>View</Button>}
        {onEdit && <Button onClick={() => onEdit(params.row.id)}>Edit</Button>}
        {onDelete && (
          <Button color="error" onClick={() => onDelete(params.row.id)}>
            Delete
          </Button>
        )}
      </>
    ),
  };

  return (
    <DataGrid
      rows={rows}
      columns={[...columns, actionColumn]}
      pageSizeOptions={[5, 10, 25]}
      autoHeight
      getRowId={(row) => row.id || row._id}
    />
  );
}