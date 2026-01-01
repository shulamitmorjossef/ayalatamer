import { useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import CountryForm from "../components/CountryForm";
import ConfirmDialog from "../components/ConfirmDialog";
import type { CountryPayload } from "../api/countryApi";
import { createCountry } from "../api/countryApi";
import { useSetRecoilState } from "recoil";
import { editingCountryNameState } from "../state/countryState";

export default function NewCountryPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const setEditingName = useSetRecoilState(editingCountryNameState);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: CountryPayload) => createCountry(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["countries"] });
      setHasUnsavedChanges(false);
      setEditingName("");

      // ✅ עוברים לטבלה + מעבירים הודעת הצלחה
      navigate("/countries", {
        replace: true,
        state: { toast: { severity: "success", message: "נוצר בהצלחה" } },
      });
    },
    onError: () => {
      // ✅ אם נכשל — נשארים בעמוד ונראה הודעה (את זה נשאיר בתוך CountryForm או נוסיף Toast פה אם תרצי)
      // כרגע נוח להשאיר הודעת שגיאה בתוך הטופס/Toast מקומי אם יש לך.
      alert("יצירה נכשלה");
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
    setEditingName("");
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
          try {
            await mutation.mutateAsync(values);
          } catch {
            // onError כבר מטפל
          }
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
        onConfirm={() => {
          setEditingName("");
          navigate("/countries");
        }}
        onCancel={() => setConfirmExitOpen(false)}
      />
    </Container>
  );
}
