import { http } from "./http";

export type CrudPerm = { read: boolean; create: boolean; update: boolean; delete: boolean };
export type Permissions = { countries: CrudPerm; cities: CrudPerm };

export type AdminUserRow = {
  id: string;
  username: string;
  role: "ADMIN" | "USER";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImagePath: string | null;
  permissions: Permissions;
  createdAt?: string;
  updatedAt?: string;
};

export async function adminGetUsersApi() {
  const { data } = await http.get<AdminUserRow[]>("/users");
  return data;
}

export async function adminUpdateUserApi(
  id: string,
  body: Partial<Pick<AdminUserRow, "role" | "firstName" | "lastName" | "phone" | "permissions">>
) {
  const { data } = await http.put<AdminUserRow>(`/users/${id}`, body);
  return data;
}
