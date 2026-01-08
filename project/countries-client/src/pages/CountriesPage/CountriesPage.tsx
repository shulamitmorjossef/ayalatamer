import { useMemo, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { toast } from "react-toastify";

import CountriesTable from "../../components/CountriesTable";
import LoadingIndicator from "../../components/LoadingIndicator";
import ConfirmDialog from "../../components/ConfirmDialog";

import type { Country } from "../../api/countryApi";
import { useCountriesQuery, useCountryMutations } from "../../api/countryQueries";

import { editingCountryNameState } from "../../state/countryState";
import { PAGE_TITLES, PAGE_DESCRIPTIONS, DIALOG_TEXTS } from "../../utils/constants";

import "./CountriesPage.scss";

export default function CountriesPage() {
  const navigate = useNavigate();
  const setEditingName = useSetRecoilState(editingCountryNameState);

  const [deleteTarget, setDeleteTarget] = useState<Country | null>(null);

  const { data: countries, isLoading } = useCountriesQuery();
  const { remove } = useCountryMutations();

  const rows = useMemo(() => countries ?? [], [countries]);

  return (
    <Container maxWidth={false} disableGutters className="countries-page">
      <Box className="countries-page__header">
        <Typography variant="h4" fontWeight={700}>
          {PAGE_TITLES.COUNTRIES_LIST}
        </Typography>
        <Typography variant="body2">{PAGE_DESCRIPTIONS.COUNTRIES_LIST}</Typography>
      </Box>

      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <CountriesTable
          rows={rows}
          onEdit={(id, name) => {
            setEditingName(name);
            navigate(`/countries/edit/${id}`);
          }}
          onAdd={() => {
            setEditingName("");
            navigate("/countries/new");
          }}
          onDelete={(row) => setDeleteTarget(row)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={DIALOG_TEXTS.DELETE_TITLE}
        description={deleteTarget ? `האם את/ה בטוח/ה שברצונך למחוק את ${deleteTarget.name}?` : ""}
        confirmText={DIALOG_TEXTS.DELETE_CONFIRM}
        cancelText={DIALOG_TEXTS.DELETE_CANCEL}
        loading={remove.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          remove.mutate(deleteTarget._id, {
            onSuccess: () => {
              toast.success("המדינה נמחקה בהצלחה!");
              setDeleteTarget(null);
            },
          });
        }}
      />
    </Container>
  );
}
