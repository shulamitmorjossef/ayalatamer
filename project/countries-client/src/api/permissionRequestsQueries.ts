// file: src/api/permissionRequestsQueries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminDecidePermissionRequestApi,
  adminPendingPermissionRequestsApi,
  createPermissionRequestApi,
  myPermissionRequestsApi,
} from "./permissionRequestsApi";

export function useMyPermissionRequests() {
  return useQuery({
    queryKey: ["permission-requests", "me"],
    queryFn: myPermissionRequestsApi,
  });
}

export function useCreatePermissionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPermissionRequestApi,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["permission-requests", "me"] });
    },
  });
}

export function useAdminPendingPermissionRequests() {
  return useQuery({
    queryKey: ["permission-requests", "admin", "pending"],
    queryFn: adminPendingPermissionRequestsApi,
  });
}

export function useAdminDecidePermissionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "APPROVED" | "REJECTED" }) =>
      adminDecidePermissionRequestApi(id, decision),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["permission-requests", "admin", "pending"] });
      await qc.invalidateQueries({ queryKey: ["permission-requests", "me"] });

      
    },
  });
}
