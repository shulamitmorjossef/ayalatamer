import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Box, Container, createTheme, ThemeProvider } from "@mui/material"; // הוסיפו createTheme, ThemeProvider
import { CacheProvider } from "@emotion/react"; // ייבוא חדש
import createCache from "@emotion/cache"; // ייבוא חדש
import { prefixer } from "stylis"; // ייבוא חדש
import rtlPlugin from "stylis-plugin-rtl"; // ייבוא חדש

import Navbar from "./components/Navbar";
import CountriesPage from "./pages/CountriesPage/CountriesPage";
import EditCountryPage from "./pages/EditCountryPage/EditCountryPage";
import NewCountryPage from "./pages/NewCountryPage/NewCountryPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignupPage from "./pages/SignupPage/SignupPage";
import AdminUsersPage from "./pages/AdminUsersPage/AdminUsersPage";
import PermissionRequestsPage from "./pages/PermissionRequestsPage/PermissionRequestsPage";
import AdminPermissionRequestsPage from "./pages/AdminPermissionRequestsPage/AdminPermissionRequestsPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage";

import RequireAuth from "./components/RequireAuth";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 1. הגדרת ה-Cache עבור RTL
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// 2. יצירת ה-Theme עם הגדרת כיוון RTL
const theme = createTheme({
  direction: 'rtl',
});

/* ===== Redirect if already logged in ===== */
function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/countries" replace />;
  return <>{children}</>;
}

/* ===== Require ADMIN only ===== */
function RequireAdmin({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  if (!token) return <Navigate to="/login" replace />;
  if (!user || user.role !== "ADMIN") return <Navigate to="/countries" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    // 3. עטיפת האפליקציה בספקי ה-Theme וה-Cache
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }} dir="rtl">
          <Navbar />

          <ToastContainer
            position="top-right"
            autoClose={1500}
            newestOnTop
            closeOnClick
            rtl // ה-Toast כבר מוגדר אצלך כ-rtl, מעולה!
            pauseOnFocusLoss
            draggable
            pauseOnHover
            limit={3}
            toastClassName="custom-toast"
          />

          <Container maxWidth="lg" sx={{ py: 3 }}>
            <Routes>
              {/* ... כל ה-Routes שלך נשארים בדיוק אותו דבר ... */}
              <Route path="/login" element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
              <Route path="/signup" element={<RedirectIfAuthed><SignupPage /></RedirectIfAuthed>} />
              <Route path="/" element={<RequireAuth><Navigate to="/countries" replace /></RequireAuth>} />
              <Route path="/countries" element={<RequireAuth><CountriesPage /></RequireAuth>} />
              <Route path="/countries/new" element={<RequireAuth><NewCountryPage /></RequireAuth>} />
              <Route path="/countries/edit/:id" element={<RequireAuth><EditCountryPage /></RequireAuth>} />
              <Route path="/permissions/request" element={<RequireAuth><PermissionRequestsPage /></RequireAuth>} />
              <Route path="/admin/users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
              <Route path="/admin/permission-requests" element={<RequireAdmin><AdminPermissionRequestsPage /></RequireAdmin>} />
              <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="*" element={<div style={{ padding: 16 }}>Not Found</div>} />
            </Routes>
          </Container>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}