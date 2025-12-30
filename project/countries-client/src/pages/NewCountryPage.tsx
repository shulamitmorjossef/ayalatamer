import { useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import CountryForm from "../components/CountryForm";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import type { CountryPayload } from "../api/countryApi";
import { createCountry } from "../api/countryApi";

export default function NewCountryPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);

  const [toast, setToast] = useState<{
    open: boolean;
    severity: "success" | "error" | "info" | "warning";
    message: string;
  }>({ open: false, severity: "info", message: "" });

  const mutation = useMutation({
    mutationFn: (payload: CountryPayload) => createCountry(payload),
    onSuccess: () => {
      setToast({ open: true, severity: "success", message: "נוצר בהצלחה" });
      qc.invalidateQueries({ queryKey: ["countries"] });
      setHasUnsavedChanges(false);
      navigate("/countries");
    },
    onError: () => {
      setToast({ open: true, severity: "error", message: "יצירה נכשלה" });
    },
  });

  const initialValues: CountryPayload = {
    name: "",
    flag: "",
    population: 0,
    region: "",
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setConfirmExitOpen(true);
      return;
    }
    navigate("/countries");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          יצירת מדינה חדשה
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          לאחר יצירה הטבלה תתעדכן אוטומטית
        </Typography>
      </Box>

      <CountryForm
        mode="new"
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
