export enum UserRole {
  ADMIN = "ADMIN",
  FUNCIONARIO = "FUNCIONARIO",
  USUARIO = "USUARIO",
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.FUNCIONARIO]: "Funcionario",
  [UserRole.USUARIO]: "Usuario",
};

export function normalizeRole(role?: string | null): UserRole {
  if (role === UserRole.ADMIN || role === UserRole.FUNCIONARIO) {
    return role;
  }
  return UserRole.USUARIO;
}

export function isAdmin(role?: string | null) {
  return normalizeRole(role) === UserRole.ADMIN;
}

export function canFinalizeOffline(role?: string | null) {
  const normalized = normalizeRole(role);
  return normalized === UserRole.ADMIN || normalized === UserRole.FUNCIONARIO;
}
