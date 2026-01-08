import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { useMyProfile, useUpdateMyProfile } from "../../api/profileQueries";

export default function ProfilePage() {
  const { data, isLoading, isError } = useMyProfile();
  const updateMut = useUpdateMyProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);

  if (isLoading) {
    return (
      <Container sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError || !data) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">שגיאה בטעינת פרופיל</Alert>
      </Container>
    );
  }

  const profile = data;

  async function onSave() {
    const fd = new FormData();
    fd.append("firstName", firstName || profile.firstName);
    fd.append("lastName", lastName || profile.lastName);
    fd.append("phone", phone || profile.phone);
    if (file) fd.append("profileImage", file);

    try {
      const updated = await updateMut.mutateAsync(fd);

      // עדכון localStorage כדי שה-Navbar יתעדכן מיד (תמונה)
      const rawUser = localStorage.getItem("user");
      const stored = rawUser ? JSON.parse(rawUser) : null;
      if (stored) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...stored,
            profileImagePath: updated.profileImagePath ?? null,
          })
        );
      }

      toast.success("הפרופיל עודכן");
      setFile(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "שגיאה בעדכון");
    }
  }

  const avatarSrc = profile.profileImagePath
    ? `http://localhost:5000${profile.profileImagePath}`
    : undefined;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        הפרופיל שלי
      </Typography>

      <Box sx={{ display: "grid", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={avatarSrc} sx={{ width: 96, height: 96 }}>
            {profile.username?.[0]?.toUpperCase()}
          </Avatar>

          <Box>
            <Typography fontWeight={800}>{profile.username}</Typography>
            <Typography sx={{ opacity: 0.8 }}>
              {profile.role} • עודכן: {new Date(profile.updatedAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Button variant="outlined" component="label">
          העלאת תמונה
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Button>

        {file && (
          <Typography sx={{ fontSize: 14, opacity: 0.8 }}>
            נבחר קובץ: {file.name}
          </Typography>
        )}

        <TextField
          label="שם פרטי"
          defaultValue={profile.firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          label="שם משפחה"
          defaultValue={profile.lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <TextField
          label="טלפון"
          defaultValue={profile.phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Button variant="contained" onClick={onSave} disabled={updateMut.isPending}>
          {updateMut.isPending ? "שומר..." : "שמירה"}
        </Button>
      </Box>
    </Container>
  );


  
}
