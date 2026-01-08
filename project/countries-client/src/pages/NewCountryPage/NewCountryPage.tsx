import { useMemo, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import CountryForm from "../../components/CountryForm";
import ConfirmDialog from "../../components/ConfirmDialog";

import type { CountryPayload } from "../../api/countryApi";
import { useCountryMutations } from "../../api/countryQueries";

import { PAGE_TITLES, PAGE_DESCRIPTIONS, TOAST_MESSAGES, DIALOG_TEXTS } from "../../utils/constants";

export default function NewCountryPage() {
  const navigate = useNavigate();
  const { create } = useCountryMutations(); 
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);

  const initialValues = useMemo<CountryPayload>(
    () => ({ name: "", flag: "", population: 0, region: "" }),
    []
  );

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
        <Typography variant="h5" fontWeight={800}>{PAGE_TITLES.NEW_COUNTRY}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>{PAGE_DESCRIPTIONS.NEW_COUNTRY}</Typography>
      </Box>

      <CountryForm
        mode="new"
        initialValues={initialValues}
        onSubmit={async (values) => {
          if (create.isPending) return;
          await create.mutateAsync(values);
          toast.success(TOAST_MESSAGES.CREATE_SUCCESS);
          navigate("/countries");
        }}
        onCancel={handleCancel}
        onDirtyChange={setHasUnsavedChanges}
      />

      <ConfirmDialog
        open={confirmExitOpen}
        title={DIALOG_TEXTS.EXIT_WITHOUT_SAVE_TITLE}
        description={DIALOG_TEXTS.EXIT_WITHOUT_SAVE_DESCRIPTION}
        confirmText={DIALOG_TEXTS.CONFIRM}
        cancelText={DIALOG_TEXTS.CANCEL}
        onConfirm={() => {
          setConfirmExitOpen(false);
          navigate("/countries");
        }}
        onCancel={() => setConfirmExitOpen(false)}
      />
    </Container>
  );
}
