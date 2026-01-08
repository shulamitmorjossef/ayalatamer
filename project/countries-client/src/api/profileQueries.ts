import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfileApi, updateMyProfileApi } from "./profileApi";

export function useMyProfile() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMyProfileApi,
  });
}

export function useUpdateMyProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfileApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
