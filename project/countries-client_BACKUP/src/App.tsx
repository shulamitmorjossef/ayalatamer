import { Navigate, Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar";
import CountriesPage from "./pages/CountriesPage";
import EditCountryPage from "./pages/EditCountryPage";
import NewCountryPage from "./pages/NewCountryPage";

function NotFoundPage() {
  return <div style={{ padding: 16 }}>Not Found</div>;
}

export default function App() {
  return (
    <Box sx={{ minHeight: "100vh", width: "100%", bgcolor: "#f6f7fb" }}>
      <Navbar />
      <Box sx={{ width: "100%" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/countries" replace />} />
          <Route path="/countries" element={<CountriesPage />} />
          <Route path="/countries/new" element={<NewCountryPage />} />
          <Route path="/countries/:id/edit" element={<EditCountryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Box>
    </Box>
  );
}
