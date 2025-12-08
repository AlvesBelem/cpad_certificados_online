export enum UserRole {
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
  USER = "USER",
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.EMPLOYEE]: "Funcionario",
  [UserRole.USER]: "Usuario",
};

export function normalizeRole(role?: string | null): UserRole {
  if (role === UserRole.ADMIN || role === UserRole.EMPLOYEE) {
    return role;
  }
  return UserRole.USER;
}

export function isAdmin(role?: string | null) {
  return normalizeRole(role) === UserRole.ADMIN;
}

export function canFinalizeOffline(role?: string | null) {
  const normalized = normalizeRole(role);
  return normalized === UserRole.ADMIN || normalized === UserRole.EMPLOYEE;
}
