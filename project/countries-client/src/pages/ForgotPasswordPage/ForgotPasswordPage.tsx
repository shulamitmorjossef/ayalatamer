import { useMemo, useState } from "react";
import { Alert, Box, Button, Container, TextField, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useResetPassword } from "../../api/passwordResetQueries";

export default function ResetPasswordPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();

  const token = useMemo(() => params.get("token") ?? "", [params]);

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mut = useResetPassword();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const p1 = newPassword;
    const p2 = confirm;

    if (!token) {
      setError("חסר token בקישור. נא לפתוח את הלינק מהאימייל מחדש.");
      return;
    }

    if (!p1 || p1.length < 8) {
      setError("סיסמה חייבת להיות לפחות 8 תווים");
      return;
    }

    if (p1 !== p2) {
      setError("הסיסמאות לא תואמות");
      return;
    }

    try {
      await mut.mutateAsync({ token, newPassword: p1 });
      toast.success("הסיסמה עודכנה. אפשר להתחבר");
      nav("/login", { replace: true });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "שגיאה באיפוס סיסמה");
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        איפוס סיסמה
      </Typography>

      {!token && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          לא נמצא token ב־URL. ודאי שפתחת את הקישור מהאימייל (…/reset-password?token=XXX)
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
        <TextField
          label="סיסמה חדשה"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <TextField
          label="אישור סיסמה חדשה"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <Button type="submit" variant="contained" disabled={mut.isPending}>
          {mut.isPending ? "מעדכן..." : "איפוס סיסמה"}
        </Button>
      </Box>
    </Container>
  );
}
