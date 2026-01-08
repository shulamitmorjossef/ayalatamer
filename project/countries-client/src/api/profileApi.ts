import { http } from "./http";

export type Profile = {
  id: string;
  username: string;
  role: "ADMIN" | "USER";
  firstName: string;
  lastName: string;
  phone: string;
  profileImagePath: string | null;
  permissions: any;
  createdAt: string;
  updatedAt: string;
};

export async function getMyProfileApi() {
  const { data } = await http.get<Profile>("/users/me");
  return data;
}

export async function updateMyProfileApi(formData: FormData) {
  const { data } = await http.put<Profile>("/users/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
