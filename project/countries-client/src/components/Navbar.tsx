import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import HomeIcon from "@mui/icons-material/Home";
import { useRecoilValue } from "recoil";
import { editingCountryNameState } from "../state/countryState";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

type StoredUser = {
  id: string;
  username: string;
  role: "ADMIN" | "USER";
  profileImagePath: string | null;
};

function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

function getAvatarSrc(profileImagePath: string | null) {
  if (!profileImagePath) return null;
  return `http://localhost:5000${profileImagePath}`;
}

export default function Navbar() {
  const name = useRecoilValue(editingCountryNameState);
  const { pathname } = useLocation();
  const nav = useNavigate();
  const qc = useQueryClient();

  const token = localStorage.getItem("token");
  const user = getStoredUser();

  const isEditing = pathname.startsWith("/countries/edit/");
  const isNew = pathname === "/countries/new";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    qc.clear();
    nav("/login", { replace: true });
  }

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        {/* 🏠 Home icon */}
        <Tooltip title="דף הבית">
          <IconButton
            color="inherit"
            onClick={() => nav("/countries")}
            sx={{ mr: 1 }}
          >
            <HomeIcon />
          </IconButton>
        </Tooltip>

        {/* Logo / Title */}
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ cursor: "pointer" }}
          onClick={() => nav("/countries")}
        >
          Countries Manager
        </Typography>

        <Box sx={{ flex: 1 }} />

        {(isEditing || isNew) && (
          <Typography variant="body1" sx={{ opacity: 0.9, mr: 2 }}>
            {isNew ? "יצירת מדינה חדשה" : `בעריכה: ${name || "..."}`}
          </Typography>
        )}

        {token && user ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button color="inherit" onClick={() => nav("/profile")}>
              פרופיל
            </Button>

            {user.role === "USER" && (
              <Button color="inherit" onClick={() => nav("/permissions/request")}>
                בקשת הרשאות
              </Button>
            )}

            {user.role === "ADMIN" && (
              <>
                <Button color="inherit" onClick={() => nav("/admin/users")}>
                  Admin Users
                </Button>
                <Button
                  color="inherit"
                  onClick={() => nav("/admin/permission-requests")}
                >
                  בקשות
                </Button>
              </>
            )}

            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {user.username}
            </Typography>

            <Avatar
              src={getAvatarSrc(user.profileImagePath) ?? undefined}
              sx={{ width: 32, height: 32 }}
            >
              {user.username?.[0]?.toUpperCase()}
            </Avatar>

            <Tooltip title="התנתקות">
              <IconButton color="inherit" onClick={logout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<LoginIcon />}
              onClick={() => nav("/login")}
            >
              התחברות
            </Button>
            <Button color="inherit" onClick={() => nav("/signup")}>
              הרשמה
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
