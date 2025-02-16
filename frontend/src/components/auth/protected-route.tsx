import { useAuthStore } from "@/store/useAuthStore";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // // Check for role-based access if roles are specified
  // if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <>{children}</>;
}
