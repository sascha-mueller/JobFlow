import { useEffect } from "react";
import { useUiStore } from "@/stores/ui.store";

export default function Dashboard() {
  const setPageMeta = useUiStore((s) => s.setPageMeta);

  useEffect(() => {
    setPageMeta({
      title: "Dashboard",
      subtitle: "Deine Übersicht",
      metaTitle: "Dashboard | JobFlow",
      metaDescription: "Verwalte deine Bewerbungen auf einen Blick.",
    });
  }, [setPageMeta]);

  return <div>Dashboard</div>;
}
