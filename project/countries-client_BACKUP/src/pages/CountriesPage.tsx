import { useEffect, useMemo, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CountriesTable from "../components/CountriesTable";
import LoadingIndicator from "../components/LoadingIndicator";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import type { Country } from "../api/countryApi";
import { deleteCountry, getCountries } from "../api/countryApi";
import { useLocation, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { editingCountryNameState } from "../state/countryState";

export default function CountriesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const setEditingName = useSetRecoilState(editingCountryNameState);

  const [toast, setToast] = useState<{
    open: boolean;
    severity: "success" | "error" | "info" | "warning";
    message: string;
  }>({ open: false, severity: "info", message: "" });

  const [deleteTarget, setDeleteTarget] = useState<Country | null>(null);

  // ✅ אם הגיע state עם toast מהניווט — מציגים אותו כאן, ואז מנקים state
  useEffect(() => {
    const navToast = (location.state as any)?.toast;
    if (navToast?.message) {
      setToast({ open: true, severity: navToast.severity, message: navToast.message });
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const {
    data: countries,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
    // ✅ כדי שלא יהיה “ריק” באמצע ריפרש
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCountry(id),
    onSuccess: (res) => {
      setToast({ open: true, severity: "success", message: res.message });
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ["countries"] });
    },
    onError: () => {
      setToast({ open: true, severity: "error", message: "מחיקה נכשלה" });
    },
  });

  const rows = useMemo(() => countries ?? [], [countries]);

  if (isError) {
    return (
      <Container maxWidth={false} disableGutters sx={{ py: 4, px: 3 }}>
        <Typography variant="h6">שגיאה בטעינת נתונים</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {error instanceof Error ? error.message : "שגיאה לא צפויה"}
        </Typography>
      </Container>
    );
  }

  // ✅ מציגים spinner רק אם אין עדיין דאטה בכלל
  if (isLoading && !countries) return <LoadingIndicator />;

  return (
    <Container maxWidth={false} disableGutters sx={{ py: 4, px: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          מדינות
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          טבלה עם CRUD דרך השרת
        </Typography>
      </Box>

      <CountriesTable
        rows={rows}
        loading={isLoading || isFetching} // ✅ overlay טעינה במקום “ריק”
        onEdit={(id, name) => {
          setEditingName(name);
          navigate(`/countries/${id}/edit`);
        }}
        onAdd={() => {
          setEditingName("");
          navigate("/countries/new");
        }}
        onDelete={(row) => setDeleteTarget(row)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="מחיקת מדינה"
        description={
          deleteTarget
            ? `האם את/ה בטוח/ה שברצונך למחוק את ${deleteTarget.name}?`
            : ""
        }
        confirmText="מחק"
        cancelText="בטל"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget._id);
        }}
      />

      <Toast
        open={toast.open}
        severity={toast.severity}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </Container>
  );
}
