// Role management and permission checking utilities

export const USER_ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  USER: "user",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

interface SessionUser {
  id?: string;
  email?: string | null;
  role?: string | null;
}

// Check if user has superadmin role
export function isSuperadmin(user: SessionUser | null | undefined): boolean {
  if (!user || !user.role) return false;
  return user.role.toLowerCase() === USER_ROLES.SUPERADMIN;
}

// Check if user has admin role (but not superadmin)
export function isAdmin(user: SessionUser | null | undefined): boolean {
  if (!user || !user.role) return false;
  return user.role.toLowerCase() === USER_ROLES.ADMIN;
}

// Check if user has admin privileges (either admin or superadmin)
export function hasAdminPrivileges(user: SessionUser | null | undefined): boolean {
  return isSuperadmin(user) || isAdmin(user);
}

// Check if user can manage other users
export function canManageUser(currentUser: SessionUser | null | undefined, targetUser: SessionUser | null | undefined): boolean {
  if (!currentUser || !targetUser) return false;
  
  // Superadmin can manage anyone
  if (isSuperadmin(currentUser)) return true;
  
  // Admin can manage users but not superadmins
  if (isAdmin(currentUser) && !isSuperadmin(targetUser)) return true;
  
  return false;
}

// Check if user can assign a specific role
export function canAssignRole(currentUser: SessionUser | null | undefined, roleToAssign: string): boolean {
  if (!currentUser) return false;
  
  const normalizedRole = roleToAssign.toLowerCase();
  
  // Only superadmin can assign superadmin role
  if (normalizedRole === USER_ROLES.SUPERADMIN) {
    return isSuperadmin(currentUser);
  }
  
  // Both admin and superadmin can assign admin and user roles
  return hasAdminPrivileges(currentUser);
}

// Check if user can delete a specific user
export function canDeleteUser(currentUser: SessionUser | null | undefined, targetUser: SessionUser | null | undefined): boolean {
  return canManageUser(currentUser, targetUser);
}

// Check if user can update a specific user
export function canUpdateUser(currentUser: SessionUser | null | undefined, targetUser: SessionUser | null | undefined): boolean {
  return canManageUser(currentUser, targetUser);
}
