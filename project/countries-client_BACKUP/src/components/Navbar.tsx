import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { useRecoilValue } from "recoil";
import { editingCountryNameState } from "../state/countryState";
import { useLocation } from "react-router-dom";

export default function Navbar() {
  const name = useRecoilValue(editingCountryNameState);
  const { pathname } = useLocation();

  const isEditing = pathname.startsWith("/countries/edit/");
  const isNew = pathname === "/countries/new";

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <Typography variant="h6" fontWeight={800}>
          Countries Manager
        </Typography>

        <Box sx={{ flex: 1 }} />

        {(isEditing || isNew) && (
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {isNew ? "יצירת מדינה חדשה" : `בעריכה: ${name || "..."}`}
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
}
