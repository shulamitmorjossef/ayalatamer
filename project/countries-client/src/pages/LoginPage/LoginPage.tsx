import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Container, TextField, Typography } from "@mui/material";
import { loginApi, syncMeToStorage } from "../../api/authApi";
import { toast } from "react-toastify";

export default function LoginPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. ביצוע התחברות וקבלת טוקן
      const res = await loginApi(username, password);

      // 2. שמירת הטוקן ב-Storage
      localStorage.setItem("token", res.token);

      // 3. משיכת פרטי המשתמש העדכניים (כולל Role ו-Permissions) ושמירתם ב-Storage
      // ודאי שפונקציה זו מבצעת localStorage.setItem("user", JSON.stringify(data))
      const user = await syncMeToStorage();

      toast.success(`ברוך הבא, ${user.username}`);

      // 4. לוגיקת ניתוב לפי סוג המשתמש (Role)
      // אם המשתמש הוא אדמין, הוא עובר למסך ניהול המשתמשים
      if (user.role === "ADMIN") {
        nav("/admin/users", { replace: true });
      } else {
        // משתמש רגיל עובר למסך המדינות
        nav("/countries", { replace: true });
      }

    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "התחברות נכשלה";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom align="center">
        התחברות למערכת
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box 
        component="form" 
        onSubmit={onSubmit} 
        sx={{ 
          display: "grid", 
          gap: 3, 
          p: 4, 
          boxShadow: 3, 
          borderRadius: 2,
          bgcolor: 'background.paper' 
        }}
      >
        <TextField 
          label="שם משתמש" 
          variant="outlined"
          fullWidth
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required
        />
        <TextField 
          label="סיסמה" 
          type="password" 
          variant="outlined"
          fullWidth
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          size="large"
          disabled={loading}
          fullWidth
        >
          {loading ? "מתחבר..." : "התחבר"}
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2">
            <RouterLink to="/forgot-password" style={{ textDecoration: 'none', color: '#1976d2' }}>
              שכחת סיסמה?
            </RouterLink>
          </Typography>
          <Typography variant="body2">
            אין לך חשבון? {" "}
            <RouterLink to="/signup" style={{ textDecoration: 'none', color: '#1976d2' }}>
              הרשמה
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}