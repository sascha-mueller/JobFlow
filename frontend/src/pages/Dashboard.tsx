import { useEffect } from "react";
import { useUiStore } from "@/stores/ui.store";

export default function Dashboard() {
  const setPageMeta = useUiStore((s) => s.setPageMeta);

  useEffect(() => {
    setPageMeta({
      title: "Übersicht",
      subtitle: "Deine Bewerbungen",
      metaTitle: "Dein Bewerbungsdashboard | JobFlow",
      metaDescription:
        "Verwalte deine Bewerbungen im Bewerbungsdashboard an einer Stelle.",
    });
  }, [setPageMeta]);

  return <div>Dashboard</div>;
}
