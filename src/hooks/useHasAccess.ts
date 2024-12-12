// hooks/useHasAccess.ts
import { useClerk } from "@clerk/nextjs";
import { FC } from "react";

// Define all possible roles in your application
export type UserRole = "admin" | "analyst" | "coach" | "player" | "staff";

export const useHasAccess = () => {
  const { user } = useClerk();

  const getUserRoles = (): UserRole[] => {
    // Check both 'role' and 'roles' in metadata
    const roles = user?.publicMetadata?.roles || user?.publicMetadata?.role;
    return (Array.isArray(roles) ? roles : []) as UserRole[];
  };

  const hasRole = (role: UserRole): boolean => {
    const userRoles = getUserRoles();
    return userRoles.includes(role);
  };

  const hasAnyRole = (targetRoles: UserRole[]): boolean => {
    const userRoles = getUserRoles();
    return targetRoles.some((role) => userRoles.includes(role));
  };

  const hasAllRoles = (roles: UserRole[]): boolean => {
    const userRoles = getUserRoles();
    return roles.every((role) => userRoles.includes(role));
  };

  // Predefined common role checks
  const hasManagementAccess = (): boolean => hasAnyRole(["admin"]);
  const hasStaffAccess = (): boolean => hasAnyRole(["admin", "staff"]);
  const hasAnalystAccess = (): boolean => hasAnyRole(["admin", "analyst"]);
  const hasViewOnlyAccess = (): boolean =>
    hasAnyRole(["coach", "player", "staff"]);
  const isAdmin = (): boolean => hasRole("admin");
  const isAnalyst = (): boolean => hasRole("analyst");
  const isCoach = (): boolean => hasRole("coach");
  const isPlayer = (): boolean => hasRole("player");
  const isStaff = (): boolean => hasRole("staff");

  return {
    getUserRoles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasManagementAccess,
    hasAnalystAccess,
    hasStaffAccess,
    hasViewOnlyAccess,
    isAdmin,
    isAnalyst,
    isCoach,
    isPlayer,
    isStaff,
  };
};

// Simplified version without HOC
export const RoleGuard: FC<{
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}> = ({ children, allowedRoles, fallback = null }) => {
  const { hasAnyRole } = useHasAccess();

  if (!hasAnyRole(allowedRoles)) {
    return fallback;
  }

  return children;
};
