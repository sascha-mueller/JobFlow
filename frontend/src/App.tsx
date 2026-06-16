import { BrowserRouter } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import AppRoutes from "@/routes";

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  );
}
