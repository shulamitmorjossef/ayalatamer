import { http } from "./http";

export async function forgotPasswordApi(email: string) {
  const { data } = await http.post<{ message: string }>("/auth/forgot-password", { email });
  return data;
}

export async function resetPasswordApi(token: string, newPassword: string) {
  const { data } = await http.post<{ message: string }>("/auth/reset-password", {
    token,
    newPassword,
  });
  return data;
}
