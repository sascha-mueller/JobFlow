import { Routes, Route, Navigate } from "react-router";
import PrivateRoute from "./PrivateRoute";
import AppLayout from "@/layouts/AppLayout";
import PageNotFound from "@/pages/PageNotFound";
import LoginPage from "@/pages/LoginForm";
import RegistrationPage from "@/pages/RegistrationForm";
import Dashboard from "@/pages/Dashboard";
import CompaniesPage from "@/pages/Companies";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/companies" element={<CompaniesPage />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
