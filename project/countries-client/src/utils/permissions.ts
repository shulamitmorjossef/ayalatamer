type CrudPerm = { read: boolean; create: boolean; update: boolean; delete: boolean };
type Permissions = { countries: CrudPerm; cities: CrudPerm };

type StoredUser = {
  role: "ADMIN" | "USER";
  permissions?: Permissions;
};

export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function can(resource: keyof Permissions, action: keyof CrudPerm): boolean {
  const user = getStoredUser();
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  return !!user.permissions?.[resource]?.[action];
}
