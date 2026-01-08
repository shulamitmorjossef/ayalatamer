import { useEffect } from "react";
import { Formik, Form, useFormikContext } from "formik";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  TextField,
} from "@mui/material";
import type { CountryPayload } from "../api/countryApi";
import { countrySchema } from "../utils/validation";

type Props = {
  initialValues: CountryPayload;
  mode: "new" | "edit";
  onSubmit: (values: CountryPayload) => Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

function DirtyWatcher({
  onDirtyChange,
}: {
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const { dirty } = useFormikContext<CountryPayload>();

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  return null;
}

export default function CountryForm({
  initialValues,
  mode,
  onSubmit,
  onCancel,
  onDirtyChange,
}: Props) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader
        title={mode === "new" ? "יצירת מדינה חדשה" : "עריכת מדינה"}
        subheader="יש למלא את כל השדות עם אימות נתונים"
      />
      <Divider />

      <CardContent>
        <Formik
          initialValues={initialValues}
          validationSchema={countrySchema}
          enableReinitialize={mode === "edit"} 
          validateOnMount 
          validateOnChange 
          validateOnBlur 
          onSubmit={async (values, helpers) => {
            const formErrors = await helpers.validateForm();
            if (Object.keys(formErrors).length > 0) {
              helpers.setTouched(
                {
                  name: true,
                  flag: true,
                  population: true,
                  region: true,
                },
                true
              );
              return;
            }

            try {
              await onSubmit({
                name: values.name.trim(),
                flag: values.flag.trim(),
                population: Number(values.population),
                region: values.region.trim(),
              });

              if (mode === "edit") {
                helpers.resetForm({ values });
              } else {
                
              }
            } finally {
              helpers.setSubmitting(false);
            }
          }}
        >
          {({
            values,
            handleChange,
            handleBlur,
            touched,
            errors,
            isSubmitting,
            isValid,
            dirty,
          }) => {
       
            const disableSave =
              isSubmitting || !isValid || (mode === "edit" ? !dirty : false);

            return (
              <Form noValidate>
                <DirtyWatcher onDirtyChange={onDirtyChange} />

                <Stack spacing={2.5}>
                  <TextField
                    label="שם המדינה"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.name && !!errors.name}
                    helperText={touched.name ? (errors.name as string) : " "}
                    fullWidth
                  />

                  <TextField
                    label="קישור לדגל (URL)"
                    name="flag"
                    value={values.flag}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.flag && !!errors.flag}
                    helperText={touched.flag ? (errors.flag as string) : " "}
                    fullWidth
                  />

                  <TextField
                    label="אוכלוסייה"
                    name="population"
                    value={values.population}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.population && !!errors.population}
                    helperText={
                      touched.population ? (errors.population as string) : " "
                    }
                    fullWidth
                    inputMode="numeric"
                  />

                  <TextField
                    label="אזור"
                    name="region"
                    value={values.region}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.region && !!errors.region}
                    helperText={touched.region ? (errors.region as string) : " "}
                    fullWidth
                  />

                  <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      type="button"
                      onClick={onCancel}
                      disabled={isSubmitting}
                    >
                      בטל
                    </Button>

                    <Button
                      variant="contained"
                      type="submit"
                      disabled={disableSave}
                    >
                      {isSubmitting ? "שומר..." : "אישור"}
                    </Button>
                  </Stack>
                </Stack>
              </Form>
            );
          }}
        </Formik>
      </CardContent>
    </Card>
  );
}
