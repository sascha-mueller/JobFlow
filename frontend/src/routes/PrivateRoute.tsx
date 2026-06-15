import { Navigate, Outlet } from "react-router";
// import { useAuthStore } from "@/stores/auth.store";

export default function PrivateRoute() {
  // const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthenticated = false; // placeholder until auth.store is created

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
