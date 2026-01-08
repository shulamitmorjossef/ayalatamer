import { http } from "./http";
import type { Permissions } from "./adminUsersApi";

export type PermissionRequest = {
  _id: string;
  userId: string;
  requested: Partial<Permissions>;
  message: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  decidedBy: string | null;
  decidedAt: string | null;
  isReadByAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function createPermissionRequestApi(payload: {
  requested: Partial<Permissions>;
  message?: string;
}) {
  const { data } = await http.post<PermissionRequest>("/permission-requests", payload);
  return data;
}

export async function myPermissionRequestsApi() {
  const { data } = await http.get<PermissionRequest[]>("/permission-requests/me");
  return data;
}

export async function adminPendingPermissionRequestsApi() {
  const { data } = await http.get<PermissionRequest[]>("/permission-requests/admin/pending");
  return data;
}

export async function adminDecidePermissionRequestApi(id: string, decision: "APPROVED" | "REJECTED") {
  const { data } = await http.patch<PermissionRequest>(`/permission-requests/admin/${id}/decide`, { decision });
  return data;
}
