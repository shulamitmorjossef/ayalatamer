import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Container, TextField, Typography } from "@mui/material";
import { loginApi, syncMeToStorage } from "../../api/authApi";
import { Link as RouterLink } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("test1");
  const [password, setPassword] = useState("12345678");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginApi(username, password);

      // ✅ קודם שומרים טוקן
      localStorage.setItem("token", res.token);

      // ✅ ואז מביאים ME כדי לקבל permissions הכי עדכני
      await syncMeToStorage();

      nav("/countries", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        התחברות
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
        <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "מתחבר..." : "התחברי"}
        </Button>
      </Box>

      <Typography variant="body2" sx={{ mt: 1 }}>
        <RouterLink to="/forgot-password">שכחת סיסמה?</RouterLink>
      </Typography>
    </Container>
  );
}
