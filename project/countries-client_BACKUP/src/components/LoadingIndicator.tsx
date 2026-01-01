import { Box, CircularProgress } from "@mui/material";

export default function LoadingIndicator() {
  return (
    <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
      <CircularProgress />
    </Box>
  );
}
