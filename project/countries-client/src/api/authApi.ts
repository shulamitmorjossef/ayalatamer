import { http } from "./http";

export type Permissions = {
  countries?: { read?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  cities?: { read?: boolean; create?: boolean; update?: boolean; delete?: boolean };
};

export type UserDTO = {
  id: string;
  username: string;
  role: "ADMIN" | "USER";
  profileImagePath: string | null;

  permissions?: Permissions;

  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
};

export type LoginResponse = {
  token: string;
  user: UserDTO;
};

export type AuthMeResponse = UserDTO;

export async function loginApi(username: string, password: string) {
  const { data } = await http.post<LoginResponse>("/auth/login", { username, password });
  return data;
}

export async function signupApi(form: FormData) {
  const { data } = await http.post<LoginResponse>("/auth/signup", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function meApi() {
  const { data } = await http.get<AuthMeResponse>("/auth/me");
  return data;
}

// ✅ פונקציה אחת שמרעננת את המשתמש מהשרת ושומרת ב-localStorage
export async function syncMeToStorage() {
  const me = await meApi();
  localStorage.setItem("user", JSON.stringify(me));
  return me;
}
