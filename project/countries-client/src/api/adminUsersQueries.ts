import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminGetUsersApi, adminUpdateUserApi } from "./adminUsersApi";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: adminGetUsersApi,
  });
}

export function useAdminUpdateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => adminUpdateUserApi(id, body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
