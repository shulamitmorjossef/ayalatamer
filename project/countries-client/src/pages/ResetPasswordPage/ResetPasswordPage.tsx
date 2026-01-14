import { useMemo, useState } from "react";
import { Alert, Box, Button, Container, TextField, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useResetPassword } from "../../api/passwordResetQueries";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = useMemo(() => params.get("token") ?? "", [params]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mut = useResetPassword();

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      toast.error("חסר token ב־URL (יש להיכנס מהקישור במייל)");
      return;
    }

    if (password !== confirm) {
      toast.error("הסיסמאות לא תואמות");
      return;
    }

    try {
      await mut.mutateAsync({ token, newPassword: password });
      toast.success("הסיסמה עודכנה");
      nav("/login");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "שגיאה");
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>איפוס סיסמה</Typography>

      {!token && (
        <Alert severity="warning">
          יש להיכנס לעמוד זה דרך הקישור שנשלח למייל
        </Alert>
      )}

      <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2 }}>
        <TextField
          label="סיסמה חדשה"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="אישור סיסמה"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Button type="submit" variant="contained" disabled={mut.isPending}>
          איפוס סיסמה
        </Button>
      </Box>
    </Container>
  );
}
