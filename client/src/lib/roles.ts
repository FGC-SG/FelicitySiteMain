// Frontend role management utilities

export const USER_ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  USER: "user",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

interface User {
  id?: string;
  email?: string;
  role?: string;
}

// Check if user has superadmin role
export function isSuperadmin(user: User | null | undefined): boolean {
  if (!user || !user.role) return false;
  return user.role.toLowerCase() === USER_ROLES.SUPERADMIN;
}

// Check if user has admin role (but not superadmin)
export function isAdmin(user: User | null | undefined): boolean {
  if (!user || !user.role) return false;
  return user.role.toLowerCase() === USER_ROLES.ADMIN;
}

// Check if user has admin privileges (either admin or superadmin)
export function hasAdminPrivileges(user: User | null | undefined): boolean {
  return isSuperadmin(user) || isAdmin(user);
}

// Check if user can manage other users
export function canManageUser(currentUser: User | null | undefined, targetUser: User | null | undefined): boolean {
  if (!currentUser || !targetUser) return false;
  
  // Superadmin can manage anyone
  if (isSuperadmin(currentUser)) return true;
  
  // Admin can manage users but not superadmins
  if (isAdmin(currentUser) && !isSuperadmin(targetUser)) return true;
  
  return false;
}

// Check if user can assign a specific role
export function canAssignRole(currentUser: User | null | undefined, roleToAssign: string): boolean {
  if (!currentUser) return false;
  
  const normalizedRole = roleToAssign.toLowerCase();
  
  // Only superadmin can assign superadmin role
  if (normalizedRole === USER_ROLES.SUPERADMIN) {
    return isSuperadmin(currentUser);
  }
  
  // Both admin and superadmin can assign admin and user roles
  return hasAdminPrivileges(currentUser);
}
