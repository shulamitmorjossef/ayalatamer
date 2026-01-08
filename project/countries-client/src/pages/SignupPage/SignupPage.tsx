import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Container, Link, TextField, Typography } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { signupApi } from "../../api/authApi";

const schema = Yup.object({
  firstName: Yup.string().min(2, "לפחות 2 תווים").required("חובה"),
  lastName: Yup.string().min(2, "לפחות 2 תווים").required("חובה"),
  username: Yup.string().min(3, "לפחות 3 תווים").required("חובה"),
  email: Yup.string().email("אימייל לא תקין").required("חובה"),
  phone: Yup.string().min(7, "טלפון לא תקין").required("חובה"),
  password: Yup.string().min(8, "לפחות 8 תווים").required("חובה"),
});

export default function SignupPage() {
  const nav = useNavigate();
  const [error, setError] = useState<string | null>(null);

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        הרשמה
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          username: "",
          email: "",
          phone: "",
          password: "",
          profileImage: null as File | null,
        }}
        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          setError(null);
          try {
            const form = new FormData();
            form.append("firstName", values.firstName);
            form.append("lastName", values.lastName);
            form.append("username", values.username);
            form.append("email", values.email);
            form.append("phone", values.phone);
            form.append("password", values.password);

            // חשוב: שם השדה חייב להתאים ל-multer בשרת
            if (values.profileImage) {
              form.append("profileImage", values.profileImage);
            }

            const res = await signupApi(form);

            // שמירה כמו login
            localStorage.setItem("token", res.token);
            localStorage.setItem("user", JSON.stringify(res.user));

            nav("/countries", { replace: true });
          } catch (e: any) {
            setError(e?.response?.data?.message ?? "שגיאה בהרשמה");
          } finally {
            helpers.setSubmitting(false);
          }
        }}
      >
        {({
          values,
          handleChange,
          handleSubmit,
          touched,
          errors,
          isSubmitting,
          setFieldValue,
        }) => (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
            <TextField
              label="שם פרטי"
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              error={!!touched.firstName && !!errors.firstName}
              helperText={touched.firstName && errors.firstName}
            />

            <TextField
              label="שם משפחה"
              name="lastName"
              value={values.lastName}
              onChange={handleChange}
              error={!!touched.lastName && !!errors.lastName}
              helperText={touched.lastName && errors.lastName}
            />

            <TextField
              label="שם משתמש"
              name="username"
              value={values.username}
              onChange={handleChange}
              error={!!touched.username && !!errors.username}
              helperText={touched.username && errors.username}
            />

            <TextField
              label="אימייל"
              name="email"
              value={values.email}
              onChange={handleChange}
              error={!!touched.email && !!errors.email}
              helperText={touched.email && errors.email}
            />

            <TextField
              label="טלפון"
              name="phone"
              value={values.phone}
              onChange={handleChange}
              error={!!touched.phone && !!errors.phone}
              helperText={touched.phone && errors.phone}
            />

            <TextField
              label="סיסמה"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              error={!!touched.password && !!errors.password}
              helperText={touched.password && errors.password}
            />

            {/* העלאת תמונת פרופיל */}
            <Button variant="outlined" component="label">
              העלאת תמונת פרופיל
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0] ?? null;
                  setFieldValue("profileImage", file);
                }}
              />
            </Button>

            {values.profileImage && (
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                נבחר: {values.profileImage.name}
              </Typography>
            )}

            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "נרשם..." : "הרשמה"}
            </Button>

            <Typography variant="body2">
              כבר יש לך משתמש?{" "}
              <Link component={RouterLink} to="/login">
                התחברות
              </Link>
            </Typography>
          </Box>
        )}
      </Formik>
    </Container>
  );
}
