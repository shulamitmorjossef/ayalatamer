// file: src/pages/PermissionRequestsPage/PermissionRequestsPage.tsx
import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { toast } from "react-toastify";
import type { Permissions } from "../../api/adminUsersApi";
import { useCreatePermissionRequest, useMyPermissionRequests } from "../../api/permissionRequestsQueries";
import { useRefreshMe } from "../../api/authQueries"; // ✅ חדש

type Resource = keyof Permissions; // "countries" | "cities"
type Action = keyof Permissions["countries"]; // "read" | "create" | "update" | "delete"

const actions: Action[] = ["read", "create", "update", "delete"];
const resources: Resource[] = ["countries", "cities"];

function emptyRequested(): Partial<Permissions> {
  return {
    countries: {},
    cities: {},
  } as any;
}

export default function PermissionRequestsPage() {
  const [message, setMessage] = useState("");
  const [requested, setRequested] = useState<Partial<Permissions>>(emptyRequested());

  const myQ = useMyPermissionRequests();
  const createMut = useCreatePermissionRequest();
  const refreshMe = useRefreshMe(); // ✅ חדש

  const hasAny = useMemo(() => {
    for (const r of resources) for (const a of actions) if ((requested as any)?.[r]?.[a] === true) return true;
    return false;
  }, [requested]);

  function toggle(r: Resource, a: Action) {
    setRequested((prev) => {
      const next = JSON.parse(JSON.stringify(prev ?? {}));
      next[r] = next[r] ?? {};
      next[r][a] = !next[r][a];
      return next;
    });
  }

  async function submit() {
    if (!hasAny) {
      toast.error("בחרי לפחות הרשאה אחת");
      return;
    }
    try {
      await createMut.mutateAsync({ requested, message });
      toast.success("הבקשה נשלחה למנהל");
      setRequested(emptyRequested());
      setMessage("");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "שגיאה בשליחה");
    }
  }

  async function onRefreshPermissions() {
    try {
      await refreshMe.mutateAsync();
      toast.success("הרשאות עודכנו");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "שגיאה ברענון הרשאות");
    }
  }

  return (
    <Container sx={{ mt: 4, display: "grid", gap: 2 }}>
      {/* ✅ כותרת + כפתור רענון */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Typography variant="h4" sx={{ flex: 1 }}>
          בקשת הרשאות
        </Typography>

        <Button variant="outlined" onClick={onRefreshPermissions} disabled={refreshMe.isPending}>
          {refreshMe.isPending ? "מרענן..." : "רענון הרשאות"}
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography fontWeight={700} gutterBottom>
          מה לבקש?
        </Typography>

        {resources.map((r) => (
          <Box key={r} sx={{ mb: 1 }}>
            <Typography sx={{ mb: 1 }}>{r.toUpperCase()}</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {actions.map((a) => (
                <FormControlLabel
                  key={`${r}-${a}`}
                  control={<Checkbox checked={!!(requested as any)?.[r]?.[a]} onChange={() => toggle(r, a)} />}
                  label={a}
                />
              ))}
            </Box>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}

        <TextField
          label="הודעה למנהל (אופציונלי)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          sx={{ mt: 2 }}
        />

        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" onClick={submit} disabled={createMut.isPending}>
            {createMut.isPending ? "שולח..." : "שליחת בקשה"}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography fontWeight={700} gutterBottom>
          היסטוריית בקשות
        </Typography>

        {myQ.isLoading && <Typography>טוען...</Typography>}
        {myQ.isError && <Alert severity="error">שגיאה בטעינת בקשות</Alert>}

        {!myQ.isLoading && !myQ.isError && (myQ.data?.length ?? 0) === 0 && (
          <Typography sx={{ opacity: 0.8 }}>אין בקשות עדיין</Typography>
        )}

        {(myQ.data ?? []).map((r) => (
          <Box key={r._id} sx={{ py: 1 }}>
            <Typography>
              <b>{r.status}</b> • {new Date(r.createdAt).toLocaleString()}
            </Typography>
            <Typography sx={{ opacity: 0.9, fontSize: 14 }}>Message: {r.message || "-"}</Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Paper>
    </Container>
  );
}
