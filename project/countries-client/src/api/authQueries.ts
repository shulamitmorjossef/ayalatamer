// file: src/api/authQueries.ts
import { useMutation } from "@tanstack/react-query";
import { meApi } from "./authApi";

export function useRefreshMe() {
  return useMutation({
    mutationFn: meApi,
    onSuccess: (me) => {
      localStorage.setItem("user", JSON.stringify(me));
    },
  });
}
