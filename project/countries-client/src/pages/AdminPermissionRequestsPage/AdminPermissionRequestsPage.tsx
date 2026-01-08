// file: src/pages/admin/AdminPermissionRequestsPage.tsx
import { useMemo, useState } from "react";
import { Alert, Box, Button, Container, Paper, Typography, Divider } from "@mui/material";
import { toast } from "react-toastify";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useAdminDecidePermissionRequest, useAdminPendingPermissionRequests } from "../../api/permissionRequestsQueries";

type Requested = {
  countries?: { read?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  cities?: { read?: boolean; create?: boolean; update?: boolean; delete?: boolean };
};

// תומך גם אם השרת עושה populate וגם אם לא
type UserRef =
  | string
  | {
      _id: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      role?: string;
    };

type PermissionRequest = {
  _id: string;
  userId: UserRef;
  requested: Requested;
  message: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

function requestedToText(req: Requested) {
  const parts: string[] = [];
  const resources: Array<keyof Requested> = ["countries", "cities"];
  const actions: Array<"read" | "create" | "update" | "delete"> = ["read", "create", "update", "delete"];

  for (const r of resources) {
    for (const a of actions) {
      if (req?.[r]?.[a] === true) parts.push(`${String(r)}.${a}`);
    }
  }
  return parts.length ? parts.join(", ") : "-";
}

function userToLabel(userId: UserRef) {
  if (!userId) return "-";
  if (typeof userId === "string") return userId;

  const fullName = `${userId.firstName ?? ""} ${userId.lastName ?? ""}`.trim();
  const username = userId.username ? `@${userId.username}` : "";
  const role = userId.role ? `(${userId.role})` : "";

  return [username, fullName, role].filter(Boolean).join(" ").trim() || userId._id;
}

export default function AdminPermissionRequestsPage() {
  const q = useAdminPendingPermissionRequests();
  const decideMut = useAdminDecidePermissionRequest();

  const items = useMemo(() => (q.data ?? []) as PermissionRequest[], [q.data]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<{
    id: string;
    decision: "APPROVED" | "REJECTED";
  } | null>(null);

  function openConfirm(id: string, decision: "APPROVED" | "REJECTED") {
    setPendingDecision({ id, decision });
    setConfirmOpen(true);
  }

  async function confirm() {
    if (!pendingDecision) return;
    const { id, decision } = pendingDecision;

    try {
      await decideMut.mutateAsync({ id, decision });
      toast.success(decision === "APPROVED" ? "אושר" : "נדחה");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "שגיאה");
    } finally {
      setConfirmOpen(false);
      setPendingDecision(null);
    }
  }

  return (
    <Container sx={{ mt: 4, display: "grid", gap: 2 }}>
      <Typography variant="h4">בקשות הרשאה (Admin)</Typography>

      {q.isLoading && <Typography>טוען...</Typography>}
      {q.isError && <Alert severity="error">שגיאה בטעינת בקשות</Alert>}

      {!q.isLoading && !q.isError && items.length === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography sx={{ opacity: 0.8 }}>אין בקשות ממתינות</Typography>
        </Paper>
      )}

      {items.map((r) => (
        <Paper key={r._id} sx={{ p: 2 }}>
          <Typography fontWeight={800}>
            {r.status} • {new Date(r.createdAt).toLocaleString()}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            משתמש: <b>{userToLabel(r.userId)}</b>
          </Typography>

          <Typography sx={{ mt: 1 }}>
            ביקש: <b>{requestedToText(r.requested)}</b>
          </Typography>

          <Typography sx={{ mt: 1, opacity: 0.9 }}>
            הודעה: {r.message || "-"}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => openConfirm(r._id, "REJECTED")}
              disabled={decideMut.isPending}
            >
              דחה
            </Button>
            <Button
              variant="contained"
              onClick={() => openConfirm(r._id, "APPROVED")}
              disabled={decideMut.isPending}
            >
              אשר
            </Button>
          </Box>
        </Paper>
      ))}

      <ConfirmDialog
        open={confirmOpen}
        title={pendingDecision?.decision === "APPROVED" ? "אישור בקשה" : "דחיית בקשה"}
        description={
          pendingDecision?.decision === "APPROVED"
            ? "לאשר את הבקשה ולעדכן הרשאות למשתמש?"
            : "לדחות את הבקשה?"
        }
        confirmText={pendingDecision?.decision === "APPROVED" ? "אישור" : "דחייה"}
        cancelText="ביטול"
        onConfirm={confirm}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDecision(null);
        }}
      />
    </Container>
  );
}
