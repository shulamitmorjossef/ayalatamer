import { useMutation } from "@tanstack/react-query";
import { forgotPasswordApi, resetPasswordApi } from "./passwordResetApi";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPasswordApi(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (vars: { token: string; newPassword: string }) =>
      resetPasswordApi(vars.token, vars.newPassword),
  });
}
