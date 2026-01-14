import { useState } from "react";
import { Alert, Box, Button, Container, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { useForgotPassword } from "../../api/passwordResetQueries";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const mut = useForgotPassword();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await mut.mutateAsync(email);
      setDone(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "שגיאה");
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>שכחתי סיסמה</Typography>

      {done ? (
        <Alert severity="success">
          אם האימייל קיים – נשלח קישור לאיפוס סיסמה
        </Alert>
      ) : (
        <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" disabled={mut.isPending}>
            {mut.isPending ? "שולח..." : "שלח קישור"}
          </Button>
        </Box>
      )}
    </Container>
  );
}
