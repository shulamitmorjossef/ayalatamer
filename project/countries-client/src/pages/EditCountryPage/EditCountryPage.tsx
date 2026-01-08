// file: src/pages/EditCountryPage/EditCountryPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { toast } from "react-toastify";

import CountryForm from "../../components/CountryForm";
import LoadingIndicator from "../../components/LoadingIndicator";
import ConfirmDialog from "../../components/ConfirmDialog";
import CitiesSection from "../../components/CitiesSection";

import type { CountryPayload } from "../../api/countryApi";
import { useCountryQuery, useCountryMutations } from "../../api/countryQueries";
import { editingCountryNameState } from "../../state/countryState";

import {
  PAGE_TITLES,
  PAGE_DESCRIPTIONS,
  DIALOG_TEXTS,
  COMMON_TEXTS,
} from "../../utils/constants";

export default function EditCountryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setEditingName = useSetRecoilState(editingCountryNameState);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);

  const { data } = useCountryQuery(id);
  const { update } = useCountryMutations();

  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  const perms = user?.permissions;

  // ✅ permissions for Cities (includes read)
  const canReadCity = user?.role === "ADMIN" || !!perms?.cities?.read;
  const canCreateCity = user?.role === "ADMIN" || !!perms?.cities?.create;
  const canUpdateCity = user?.role === "ADMIN" || !!perms?.cities?.update;
  const canDeleteCity = user?.role === "ADMIN" || !!perms?.cities?.delete;

  useEffect(() => {
    setEditingName(data?.name ?? "");
    return () => setEditingName("");
  }, [data?.name, setEditingName]);

  const initialValues = useMemo<CountryPayload>(
    () => ({
      name: data?.name ?? "",
      flag: data?.flag ?? "",
      population: data?.population ?? 0,
      region: data?.region ?? "",
    }),
    [data]
  );

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setConfirmExitOpen(true);
      return;
    }
    setEditingName("");
    navigate("/countries");
  };

  if (!id) {
    return (
      <Container maxWidth="lg" className="edit-country-page">
        <Typography variant="h6">{COMMON_TEXTS.MISSING_ID}</Typography>
      </Container>
    );
  }

  if (!data) return <LoadingIndicator />;

  return (
    <Container maxWidth="lg" className="edit-country-page">
      <Box className="header">
        <Typography variant="h5">{PAGE_TITLES.EDIT_COUNTRY}</Typography>
        <Typography variant="body2">{PAGE_DESCRIPTIONS.EDIT_COUNTRY}</Typography>
      </Box>

      <CountryForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={async (values) => {
          if (update.isPending) return;
          await update.mutateAsync({ id, payload: values });
          setHasUnsavedChanges(false);
          navigate("/countries");
          toast.success(`המדינה "${values.name}" עודכנה בהצלחה!`);
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
          setEditingName("");
          navigate("/countries");
        }}
        onCancel={() => setConfirmExitOpen(false)}
      />

      {/* ✅ Cities section with read permission + CRUD permissions */}
      <CitiesSection
        countryId={id}
        canRead={canReadCity}
        canCreate={canCreateCity}
        canUpdate={canUpdateCity}
        canDelete={canDeleteCity}
      />
    </Container>
  );
}
