import { useMemo } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import type { AdminUserRow, Permissions } from "../../api/adminUsersApi";
import { useAdminUpdateUser, useAdminUsers } from "../../api/adminUsersQueries";

// פונקציות עזר לשכפול ושינוי הרשאות
function clonePerm(p: Permissions): Permissions {
  return JSON.parse(JSON.stringify(p));
}

function togglePerm(p: Permissions, resource: "countries" | "cities", action: keyof Permissions["countries"]) {
  const next = clonePerm(p);
  next[resource][action] = !next[resource][action];
  return next;
}

export default function AdminUsersPage() {
  const { data, isLoading, isError, error } = useAdminUsers();
  const updateMut = useAdminUpdateUser();

  const rows = data ?? [];

  const columns: GridColDef<AdminUserRow>[] = useMemo(
    () => [

      { field: "username", headerName: "שם משתמש", flex: 1, minWidth: 140, editable: true },
      { field: "firstName", headerName: "שם פרטי", flex: 1, minWidth: 120, editable: true },
      { field: "lastName", headerName: "שם משפחה", flex: 1, minWidth: 120, editable: true },
      { field: "phone", headerName: "טלפון", width: 140, editable: true }, // עכשיו ניתן לעריכה
      { field: "role", headerName: "תפקיד", width: 110 },
      { field: "email", headerName: "Email", flex: 1, minWidth: 200 }, // נשאר לקריאה בלבד לפי הדרישות
      {
        field: "countriesPerms",
        headerName: "הרשאות מדינות",
        flex: 2,
        minWidth: 320,
        sortable: false,
        renderCell: (params) => {
          const u = params.row;
          const p = u.permissions;

          const onSave = async (nextPerms: Permissions) => {
            try {
              await updateMut.mutateAsync({ id: u.id, body: { permissions: nextPerms } });
              toast.success("הרשאות עודכנו");
            } catch (e: any) {
              toast.error(e?.response?.data?.message ?? "שגיאה בעדכון");
            }
          };

          return (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              {(["read", "create", "update", "delete"] as const).map((a) => (
                <FormControlLabel
                  key={a}
                  control={
                    <Checkbox
                      size="small"
                      checked={!!p.countries[a]}
                      onChange={() => onSave(togglePerm(p, "countries", a))}
                    />
                  }
                  label={a}
                />
              ))}
            </Box>
          );
        },
      },

      {
        field: "citiesPerms",
        headerName: "הרשאות ערים",
        flex: 2,
        minWidth: 320,
        sortable: false,
        renderCell: (params) => {
          const u = params.row;
          const p = u.permissions;

          const onSave = async (nextPerms: Permissions) => {
            try {
              await updateMut.mutateAsync({ id: u.id, body: { permissions: nextPerms } });
              toast.success("הרשאות עודכנו");
            } catch (e: any) {
              toast.error(e?.response?.data?.message ?? "שגיאה בעדכון");
            }
          };

          return (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              {(["read", "create", "update", "delete"] as const).map((a) => (
                <FormControlLabel
                  key={a}
                  control={
                    <Checkbox
                      size="small"
                      checked={!!p.cities[a]}
                      onChange={() => onSave(togglePerm(p, "cities", a))}
                    />
                  }
                  label={a}
                />
              ))}
            </Box>
          );
        },
      },

      {
        field: "actions",
        headerName: "ניהול",
        width: 120,
        sortable: false,
        renderCell: (params) => {
          const u = params.row;
          async function makeUserAdmin() {
            try {
              await updateMut.mutateAsync({ id: u.id, body: { role: "ADMIN" } });
              toast.success("הפך למנהל");
            } catch (e: any) {
              toast.error(e?.response?.data?.message ?? "שגיאה");
            }
          }

          return (
            <Button
              size="small"
              variant="outlined"
              onClick={makeUserAdmin}
              disabled={u.role === "ADMIN"}
            >
              הפוך לאדמין
            </Button>
          );
        },
      },
    ],
    [updateMut]
  );

  if (isLoading) {
    return (
      <Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          {(error as any)?.response?.data?.message ?? "שגיאה בטעינת משתמשים"}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }} maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2" }}>
        ניהול משתמשים והרשאות
      </Typography>

      <Paper sx={{ height: 700, width: "100%", boxShadow: 3 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}

          // לוגיקת עדכון שדות טקסט (שם, שם משפחה, יוזרניים)
          processRowUpdate={async (newRow, oldRow) => {
            const changes: any = {};

            if (newRow.username !== oldRow.username) changes.username = newRow.username;
            if (newRow.firstName !== oldRow.firstName) changes.firstName = newRow.firstName;
            if (newRow.lastName !== oldRow.lastName) changes.lastName = newRow.lastName;
            if (newRow.phone !== oldRow.phone) changes.phone = newRow.phone; // הוספת הטלפון

            if (Object.keys(changes).length === 0) return oldRow;

            try {
              await updateMut.mutateAsync({
                id: newRow.id,
                body: changes,
              });
              toast.success("הפרטים עודכנו בהצלחה");
              return newRow;
            } catch (e: any) {
              toast.error(e?.response?.data?.message ?? "שגיאה בעדכון");
              return oldRow;
            }
          }}
        />
      </Paper>
    </Container>
  );
}