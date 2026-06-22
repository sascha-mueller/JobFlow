import { Routes, Route, Navigate } from "react-router";
import PrivateRoute from "./PrivateRoute";
import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";
import PageNotFound from "@/pages/PageNotFound";
import LoginPage from "@/pages/LoginForm";
import RegistrationPage from "@/pages/RegistrationForm";
import Dashboard from "@/pages/Dashboard";
import ApplicationsPage from "@/pages/Applications";
import ApplicationDetail from "@/pages/ApplicationDetail";
import CompaniesPage from "@/pages/Companies";
import CompanyDetail from "@/pages/CompanyDetail";
import ContactsPage from "@/pages/Contacts";
import PrintApplications from "@/pages/PrintApplications";
import ProfilePage from "@/pages/ProfilePage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route path="/bewerbungen/drucken" element={<PrintApplications />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bewerbungen" element={<ApplicationsPage />} />
          <Route path="/bewerbungen/:id" element={<ApplicationDetail />} />
          <Route path="/firmen" element={<CompaniesPage />} />
          <Route path="/firmen/:id" element={<CompanyDetail />} />
          <Route path="/kontakte" element={<ContactsPage />} />
          <Route path="/profil" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
}
