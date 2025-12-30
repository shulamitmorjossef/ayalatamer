import { Navigate, Route, Routes } from "react-router-dom";
import { Box, Container } from "@mui/material";
import Navbar from "./components/Navbar";
import CountriesPage from "./pages/CountriesPage";
import EditCountryPage from "./pages/EditCountryPage";
import NewCountryPage from "./pages/NewCountryPage";

export default function App() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/countries" replace />} />
          <Route path="/countries" element={<CountriesPage />} />
          <Route path="/countries/new" element={<NewCountryPage />} />
          <Route path="/countries/edit/:id" element={<EditCountryPage />} />
          <Route path="*" element={<div style={{ padding: 16 }}>Not Found</div>} />
        </Routes>
      </Container>
    </Box>
  );
}
