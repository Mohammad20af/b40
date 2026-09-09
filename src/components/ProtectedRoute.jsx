import { Navigate, Outlet } from "react-router-dom";
import { useDemoAuth } from "../hooks/useDemoAuth";

// Presentation-only route guard. This provides no production access control.
export default function ProtectedRoute() {
  const authenticated = useDemoAuth();
  return authenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
