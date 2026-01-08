import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import type { Country } from "../api/countryApi";

type CountriesTableProps = {
  rows: Country[];
  onEdit: (id: string, name: string) => void; 
  onDelete: (row: Country) => void;
  onAdd: () => void;
  loading?: boolean;
};

export default function CountriesTable({
  rows,
  onEdit,
  onDelete,
  onAdd,
  loading = false,
}: CountriesTableProps) {
  const columns: GridColDef<Country>[] = [
    {
      field: "flag",
      headerName: "דגל",
      width: 90,
      sortable: false,
      renderCell: (params) => (
        <img
          src={params.row.flag}
          alt={`${params.row.name} flag`}
          style={{ width: 34, height: 22, objectFit: "cover", borderRadius: 4 }}
        />
      ),
    },
    { field: "name", headerName: "שם", flex: 1, minWidth: 160 },
    {
      field: "population",
      headerName: "אוכלוסייה",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => params.row.population.toLocaleString(),
    },
    { field: "region", headerName: "אזור", flex: 1, minWidth: 140 },
    {
      field: "actions",
      headerName: "פעולות",
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="עריכה">
            <IconButton
              aria-label="edit"
              onClick={() => onEdit(params.row._id, params.row.name)}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="מחיקה">
            <IconButton
              aria-label="delete"
              onClick={() => onDelete(params.row)}
              size="small"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
          הוספה
        </Button>
      </Box>

      <Box sx={{ height: 560, bgcolor: "background.paper", borderRadius: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}
