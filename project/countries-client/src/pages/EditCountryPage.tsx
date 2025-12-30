import { useEffect, useMemo, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetRecoilState } from "recoil";

import CountryForm from "../components/CountryForm";
import LoadingIndicator from "../components/LoadingIndicator";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

import type { Country, CountryPayload } from "../api/countryApi";
import { getCountryById, updateCountry } from "../api/countryApi";
import { editingCountryNameState } from "../state/countryState";

export default function EditCountryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const setEditingName = useSetRecoilState(editingCountryNameState);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);

  const [toast, setToast] = useState<{
    open: boolean;
    severity: "success" | "error" | "info" | "warning";
    message: string;
  }>({ open: false, severity: "info", message: "" });

  const cachedCountries = qc.getQueryData<Country[]>(["countries"]);
  const cachedCountry = useMemo(
    () => cachedCountries?.find((c) => c._id === id),
    [cachedCountries, id]
  );

  // ✅ חשוב: תמיד enabled, כדי שאם צריך יביא מהשרת,
  // אבל אם יש cache – נקבל initialData מיד.
  const { data, isLoading, isError } = useQuery({
    queryKey: ["country", id],
    queryFn: () => getCountryById(id!),
    enabled: !!id,
    initialData: cachedCountry,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    setEditingName(data?.name ?? "");
    return () => setEditingName("");
  }, [data?.name, setEditingName]);

  const mutation = useMutation({
    mutationFn: (payload: CountryPayload) => updateCountry(id!, payload),
    onSuccess: (updated) => {
      setToast({ open: true, severity: "success", message: "עודכן בהצלחה" });

      // ✅ מעדכן את השם ב-Navbar גם אחרי שמירה (אם שינו שם)
      setEditingName(updated.name);

      qc.invalidateQueries({ queryKey: ["countries"] });
      qc.invalidateQueries({ queryKey: ["country", id] });

      setHasUnsavedChanges(false);
    },
    onError: () => {
      setToast({ open: true, severity: "error", message: "עדכון נכשל" });
    },
  });

  if (!id) {
    return (
      <Container maxWidth={false} disableGutters sx={{ py: 4, px: 3 }}>
        <Typography variant="h6">חסר מזהה</Typography>
      </Container>
    );
  }

  if (isLoading && !data) return <LoadingIndicator />;

  if (isError || !data) {
    return (
      <Container maxWidth={false} disableGutters sx={{ py: 4, px: 3 }}>
        <Typography variant="h6">שגיאה בטעינת מדינה</Typography>
      </Container>
    );
  }

  const initialValues: CountryPayload = {
    name: data.name,
    flag: data.flag,
    population: data.population,
    region: data.region,
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setConfirmExitOpen(true);
      return;
    }
    navigate("/countries");
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ py: 4, px: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          עריכת מדינה
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          השינויים ישמרו לשרת והטבלה תתעדכן אוטומטית
        </Typography>
      </Box>

      <CountryForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={async (values) => {
          await mutation.mutateAsync(values);
        }}
        onCancel={handleCancel}
        onDirtyChange={(dirty) => setHasUnsavedChanges(dirty)}
      />

      <ConfirmDialog
        open={confirmExitOpen}
        title="יציאה ללא שמירה"
        description="בוצעו שינויים. האם את/ה בטוח/ה שברצונך לצאת ללא שמירה?"
        confirmText="צא"
        cancelText="חזור"
        onConfirm={() => navigate("/countries")}
        onCancel={() => setConfirmExitOpen(false)}
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


