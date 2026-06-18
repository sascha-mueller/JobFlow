import { useEffect } from "react";
import { BrowserRouter } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import AppRoutes from "@/routes";
import { useAuthStore } from "@/stores/auth.store";

function AuthInit({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthInit>
        <AppRoutes />
        <Toaster />
      </AuthInit>
    </BrowserRouter>
  );
}
