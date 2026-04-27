// src/hooks/useRoleBasedAccess.js
import { useAuth } from "./useAuth";

export const useRoleBasedAccess = () => {
  const { user, isTeacher, isStudent } = useAuth();

  const isAdmin = user?.role === "admin";

  return {
    // Role booleans
    isTeacher,
    isStudent,
    isAdmin,
    role: user?.role,
    user,

    // Permissions object
    permissions: {
      // Teacher/Admin permissions
      canCreateAssignments: isTeacher || isAdmin,
      canGradeSubmissions: isTeacher || isAdmin,
      canViewAllSubmissions: isTeacher || isAdmin,
      canManageStudents: isTeacher || isAdmin,
      canManageTeachers: isAdmin,

      // Student permissions
      canSubmitAssignments: isStudent,
      canViewOwnGrades: isStudent,
      canViewOwnSubmissions: isStudent,

      // Everyone permissions
      canViewAssignments: true,
      canViewDashboard: true,
    },
  };
};
