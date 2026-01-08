// file: src/components/CitiesSection.tsx
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import ConfirmDialog from "./ConfirmDialog";
import {
  useCities,
  useCreateCity,
  useDeleteCity,
  useUpdateCity,
} from "../api/citiesQueries";

type Props = {
  countryId: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export default function CitiesSection({
  countryId,
  canRead,
  canCreate,
  canUpdate,
  canDelete,
}: Props) {
  const { data, isLoading, isError } = useCities(countryId);
  const createMut = useCreateCity(countryId);
  const updateMut = useUpdateCity(countryId);
  const deleteMut = useDeleteCity(countryId);

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const cities = useMemo(() => data ?? [], [data]);

  if (!canRead) {
    return (
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" fontWeight={800} gutterBottom>
          ערים במדינה
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>אין לך הרשאה לצפות בערים.</Typography>
      </Paper>
    );
  }

  async function onAdd() {
    const name = newName.trim();
    if (!name) return;

    try {
      await createMut.mutateAsync({ name, countryId });
      setNewName("");
      toast.success("עיר נוספה");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "שגיאה בהוספה");
    }
  }

  function startEdit(id: string, name: string) {
    setEditingId(id);
    setEditName(name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function saveEdit(id: string) {
    const name = editName.trim();
    if (!name) return;

    try {
      await updateMut.mutateAsync({ id, name });
      toast.success("עודכן");
      cancelEdit();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "שגיאה בעדכון");
    }
  }

  function askDelete(id: string) {
    setDeleteId(id);
  }

  async function confirmDelete() {
    if (!deleteId) return;

    try {
      await deleteMut.mutateAsync(deleteId);
      toast.success("נמחק");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "שגיאה במחיקה");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>
        ערים במדינה
      </Typography>

      {/* Add city */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          label="שם עיר חדשה"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          fullWidth
          disabled={!canCreate || createMut.isPending}
          onKeyDown={(e) => {
            if (e.key === "Enter") onAdd();
          }}
        />
        <Button
          variant="contained"
          onClick={onAdd}
          disabled={!canCreate || createMut.isPending || !newName.trim()}
        >
          הוספה
        </Button>
      </Box>

      {isLoading && <CircularProgress />}
      {isError && <Typography color="error">שגיאה בטעינת ערים</Typography>}

      {!isLoading && !isError && (
        <Box sx={{ display: "grid", gap: 1 }}>
          {cities.length === 0 ? (
            <Typography sx={{ opacity: 0.8 }}>אין ערים עדיין.</Typography>
          ) : (
            cities.map((c) => (
              <Box
                key={c._id}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                {editingId === c._id ? (
                  <>
                    <TextField
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      size="small"
                      fullWidth
                      disabled={!canUpdate || updateMut.isPending}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(c._id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                    <IconButton
                      onClick={() => saveEdit(c._id)}
                      disabled={!canUpdate || updateMut.isPending}
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton onClick={cancelEdit}>
                      <CloseIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Typography sx={{ flex: 1 }}>{c.name}</Typography>

                    <IconButton
                      onClick={() => startEdit(c._id, c.name)}
                      disabled={!canUpdate}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      onClick={() => askDelete(c._id)}
                      disabled={!canDelete || deleteMut.isPending}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            ))
          )}
        </Box>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="מחיקת עיר"
        description="האם למחוק את העיר? הפעולה לא ניתנת לביטול."
        confirmText="מחיקה"
        cancelText="ביטול"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Paper>
  );
}
