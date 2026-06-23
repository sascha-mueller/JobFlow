import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router";
import { Briefcase, ChevronRight, Printer } from "lucide-react";
import type { Application } from "@jobflow/shared";
import { applicationsApi } from "@/lib/applications.api";
import { useUiStore } from "@/stores/ui.store";
import { STATUS_LABELS } from "@/components/ApplicationFormDialog";

const PIPELINE_STATS = [
  { key: "DRAFT", label: "Entwurf", statuses: ["DRAFT", "WATCHLIST"] },
  { key: "SENT", label: "Eingereicht", statuses: ["SENT"] },
  { key: "INTERVIEW", label: "Im Gespräch", statuses: ["INTERVIEW"] },
  { key: "OFFER", label: "Angebot", statuses: ["OFFER"] },
  { key: "REJECTED", label: "Absage", statuses: ["REJECTED"] },
] as const;

export default function Dashboard() {
  const setPageMeta = useUiStore((s) => s.setPageMeta);
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "error" | "done">("loading");

  useEffect(() => {
    setPageMeta({
      title: "Übersicht",
      subtitle: "Deine Bewerbungen auf einen Blick",
      metaTitle: "Übersicht | JobVault",
      metaDescription: "Dein Bewerbungs-Dashboard: Pipeline, Favoriten und letzte Aktivitäten.",
    });
  }, [setPageMeta]);

  useEffect(() => {
    applicationsApi
      .getAll()
      .then((data) => {
        setApplications(data);
        setLoadState("done");
      })
      .catch(() => setLoadState("error"));
  }, []);

  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const app of applications) {
      counts[app.status] = (counts[app.status] ?? 0) + 1;
    }
    return counts;
  }, [applications]);

  const recent = useMemo(
    () =>
      [...applications]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [applications],
  );

  const favorites = useMemo(() => applications.filter((a) => a.isFavorite), [applications]);

  if (loadState === "loading") return <p className="apps-feedback">Lade …</p>;
  if (loadState === "error")
    return <p className="apps-feedback apps-feedback--error">Daten konnten nicht geladen werden.</p>;

  return (
    <div className="dashboard">
      {/* Pipeline */}
      <div className="dashboard-pipeline">
        <div className="dashboard-pipeline__total">
          <span className="dashboard-pipeline__total-count">{applications.length}</span>
          <span className="dashboard-pipeline__total-label">Gesamt</span>
        </div>
        {PIPELINE_STATS.map(({ key, label, statuses }) => {
          const count = statuses.reduce((sum, s) => sum + (pipelineCounts[s] ?? 0), 0);
          return (
            <button
              key={key}
              className="dashboard-pipeline__stat"
              onClick={() => navigate("/bewerbungen")}
            >
              <span className="dashboard-pipeline__stat-count">
                {String(count).padStart(2, "0")}
              </span>
              <span className="dashboard-pipeline__stat-label">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Content grid */}
      <div className="dashboard-grid">
        {/* Recent */}
        <section className="dashboard-section">
          <header className="dashboard-section__head">
            <h2 className="dashboard-section__title">Zuletzt hinzugefügt</h2>
            <button
              className="dashboard-section__link"
              onClick={() => navigate("/bewerbungen")}
            >
              Alle anzeigen <ChevronRight size={12} />
            </button>
          </header>

          {recent.length === 0 ? (
            <DashboardEmpty onNavigate={() => navigate("/bewerbungen")} />
          ) : (
            <ul className="dashboard-list">
              {recent.map((app) => (
                <DashboardRow
                  key={app._id}
                  app={app}
                  onClick={() => navigate(`/bewerbungen/${app._id}`)}
                />
              ))}
            </ul>
          )}
        </section>

        {/* Favorites */}
        <section className="dashboard-section">
          <header className="dashboard-section__head">
            <h2 className="dashboard-section__title">Favoriten</h2>
          </header>

          {favorites.length === 0 ? (
            <p className="dashboard-hint">Noch keine Favoriten gesetzt.</p>
          ) : (
            <ul className="dashboard-list">
              {favorites.map((app) => (
                <DashboardRow
                  key={app._id}
                  app={app}
                  onClick={() => navigate(`/bewerbungen/${app._id}`)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Print link */}
      <div className="dashboard-print-row">
        <Link
          to="/bewerbungen/drucken"
          target="_blank"
          rel="noopener noreferrer"
          className="dashboard-print-link"
        >
          <Printer size={13} />
          Druckansicht
        </Link>
      </div>
    </div>
  );
}

/* ── Row ─────────────────────────────────────────────────────── */

function DashboardRow({ app, onClick }: { app: Application; onClick: () => void }) {
  const avatarName = app.company?.name ?? app.name;
  return (
    <li className="dashboard-row" onClick={onClick}>
      <span className="dashboard-row__avatar">{initials(avatarName)}</span>
      <div className="dashboard-row__body">
        <span className="dashboard-row__name">{app.name}</span>
        {app.company?.name && (
          <span className="dashboard-row__company">{app.company.name}</span>
        )}
      </div>
      <span className="apps-status-badge" data-status={app.status}>
        {STATUS_LABELS[app.status] ?? app.status}
      </span>
      <ChevronRight size={14} className="dashboard-row__chevron" aria-hidden="true" />
    </li>
  );
}

/* ── Empty ───────────────────────────────────────────────────── */

function DashboardEmpty({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="dashboard-empty">
      <span className="dashboard-empty__icon" aria-hidden="true">
        <Briefcase size={22} />
      </span>
      <p className="dashboard-empty__text">Noch keine Bewerbungen angelegt.</p>
      <button className="btn btn-primary" onClick={onNavigate}>
        Erste Bewerbung anlegen
      </button>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0] ?? "").slice(0, 2).toUpperCase();
  return (((parts[0] ?? "")[0] ?? "") + ((parts[1] ?? "")[0] ?? "")).toUpperCase();
}
