import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps a route element. Redirects unauthenticated users to /login.
 * If `role` is specified, also checks that the user has the correct role.
 */
export default function ProtectedRoute({ children, role }) {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Wrong role → send them to their own dashboard
    const dest = user.role === "judge" ? "/judge" : "/";
    return <Navigate to={dest} replace />;
  }

  return children;
}
