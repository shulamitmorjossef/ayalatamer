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

function DirtyWatcher({ onDirtyChange }: { onDirtyChange?: (dirty: boolean) => void }) {
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
          enableReinitialize
          onSubmit={async (values, helpers) => {
            try {
              await onSubmit({
                name: values.name.trim(),
                flag: values.flag.trim(),
                population: Number(values.population),
                region: values.region.trim(),
              });

              // אחרי שמירה מוצלחת - מאפס dirty ל-false
              helpers.resetForm({ values });
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
            const disableSave = !dirty || !isValid || isSubmitting;

            return (
              <Form>
                <DirtyWatcher onDirtyChange={onDirtyChange} />

                <Stack spacing={2.5}>
                  <TextField
                    label="שם המדינה"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.name && !!errors.name}
                    helperText={touched.name ? errors.name : " "}
                    fullWidth
                  />

                  <TextField
                    label="קישור לדגל (URL)"
                    name="flag"
                    value={values.flag}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.flag && !!errors.flag}
                    helperText={touched.flag ? errors.flag : " "}
                    fullWidth
                  />

                  <TextField
                    label="אוכלוסייה"
                    name="population"
                    type="number"
                    value={values.population}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.population && !!errors.population}
                    helperText={touched.population ? errors.population : " "}
                    fullWidth
                    inputProps={{ min: 0, step: 1 }}
                  />


                  <TextField
                    label="אזור"
                    name="region"
                    value={values.region}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.region && !!errors.region}
                    helperText={touched.region ? errors.region : " "}
                    fullWidth
                  />

                  <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                    <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
                      בטל
                    </Button>

                    <Button variant="contained" type="submit" disabled={disableSave}>
                      אישור
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
