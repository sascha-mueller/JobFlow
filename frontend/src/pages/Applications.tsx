import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Briefcase, ChevronRight, MapPin, Star } from "lucide-react";
import type { Application, CreateApplicationInput } from "@jobflow/shared";
import { applicationsApi } from "@/lib/applications.api";
import { useUiStore } from "@/stores/ui.store";
import ApplicationFormDialog, {
  STATUS_LABELS,
  WORKMODE_LABELS,
} from "@/components/ApplicationFormDialog";

type FilterTab = "ALL" | "SENT" | "INTERVIEW" | "OFFER" | "DRAFT" | "REJECTED";

const PIPELINE_STATS: { key: FilterTab; label: string; statuses: string[] }[] = [
  { key: "DRAFT", label: "ENTWURF", statuses: ["DRAFT", "WATCHLIST"] },
  { key: "SENT", label: "EINGEREICHT", statuses: ["SENT"] },
  { key: "INTERVIEW", label: "IM GESPRÄCH", statuses: ["INTERVIEW"] },
  { key: "OFFER", label: "ANGEBOT", statuses: ["OFFER"] },
  { key: "REJECTED", label: "ABSAGE", statuses: ["REJECTED"] },
];

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "ALL", label: "Alle" },
  { key: "DRAFT", label: "Entwürfe" },
  { key: "SENT", label: "Eingereicht" },
  { key: "INTERVIEW", label: "Im Gespräch" },
  { key: "OFFER", label: "Angebot" },
  { key: "REJECTED", label: "Absagen" },
];

type DialogState =
  | null
  | { mode: "create" }
  | { mode: "edit"; application: Application };

export default function Applications() {
  const setPageMeta = useUiStore((s) => s.setPageMeta);
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "error" | "done">(
    "loading",
  );
  const [dialog, setDialog] = useState<DialogState>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [showFavorites, setShowFavorites] = useState(false);

  const openCreate = () => setDialog({ mode: "create" });
  const closeDialog = () => setDialog(null);

  useEffect(() => {
    setPageMeta({
      title: "Bewerbungen",
      subtitle: "Dein Bewerbungsüberblick",
      metaTitle: "Bewerbungen | JobVault",
      metaDescription: "Alle Bewerbungen in der Übersicht.",
      action: { label: "Bewerbung anlegen", onClick: openCreate },
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

  const filtered = useMemo(() => {
    let list = applications;
    if (showFavorites) list = list.filter((a) => a.isFavorite);
    switch (activeFilter) {
      case "SENT":
        return list.filter((a) => a.status === "SENT");
      case "INTERVIEW":
        return list.filter((a) => a.status === "INTERVIEW");
      case "OFFER":
        return list.filter((a) => a.status === "OFFER");
      case "DRAFT":
        return list.filter(
          (a) => a.status === "DRAFT" || a.status === "WATCHLIST",
        );
      case "REJECTED":
        return list.filter((a) => a.status === "REJECTED");
      default:
        return list;
    }
  }, [applications, activeFilter, showFavorites]);

  const handleCreate = async (data: CreateApplicationInput) => {
    const app = await applicationsApi.create(data);
    setApplications((prev) => [app, ...prev]);
    closeDialog();
    toast.success(`„${app.name}" wurde angelegt.`);
  };

  const handleUpdate = async (id: string, data: CreateApplicationInput) => {
    const updated = await applicationsApi.update(id, data);
    setApplications((prev) => prev.map((a) => (a._id === id ? updated : a)));
    closeDialog();
    toast.success(`„${updated.name}" wurde aktualisiert.`);
  };

  const handleToggleFavorite = async (
    e: React.MouseEvent,
    app: Application,
  ) => {
    e.stopPropagation();
    const updated = await applicationsApi.update(app._id, {
      isFavorite: !app.isFavorite,
    });
    setApplications((prev) =>
      prev.map((a) => (a._id === app._id ? updated : a)),
    );
  };

  if (loadState === "loading") {
    return <p className="apps-feedback">Lade Bewerbungen …</p>;
  }
  if (loadState === "error") {
    return (
      <p className="apps-feedback apps-feedback--error">
        Bewerbungen konnten nicht geladen werden.
      </p>
    );
  }

  return (
    <div className="apps-page">
      {/* Pipeline-Statusbar */}
      <div className="apps-pipeline">
        <div className="apps-pipeline__total">
          <span className="apps-pipeline__total-label">
            STATUS DER PIPELINE
          </span>
          <span className="apps-pipeline__total-count">
            {applications.length}{" "}
            {applications.length === 1 ? "Bewerbung" : "Bewerbungen"}
          </span>
        </div>
        {PIPELINE_STATS.map(({ key, label, statuses }) => {
          const count = statuses.reduce(
            (sum, s) => sum + (pipelineCounts[s] ?? 0),
            0,
          );
          return (
            <button
              key={key}
              className={`apps-pipeline__stat ${activeFilter === key ? "apps-pipeline__stat--active" : ""}`}
              onClick={() =>
                setActiveFilter((f) => (f === key ? "ALL" : key))
              }
            >
              <span className="apps-pipeline__stat-label">{label}</span>
              <span className="apps-pipeline__stat-count">
                {String(count).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter-Toolbar */}
      <div className="apps-toolbar">
        <div className="apps-filters" role="tablist">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeFilter === key}
className={`apps-filter-tab ${activeFilter === key ? "apps-filter-tab--active" : ""}`}
              onClick={() => setActiveFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="apps-toolbar__right">
          <button
            className={`apps-toolbar__btn ${showFavorites ? "apps-toolbar__btn--active" : ""}`}
            onClick={() => setShowFavorites((f) => !f)}
          >
            <Star size={14} />
            Favoriten
          </button>
        </div>
      </div>

      {/* Tabelle */}
      {filtered.length === 0 ? (
        <ApplicationsEmpty onAdd={openCreate} />
      ) : (
        <>
          <table className="apps-table">
            <thead>
              <tr className="apps-table__head-row">
                <th className="apps-table__th apps-table__th--nr">Nr.</th>
                <th className="apps-table__th apps-table__th--position">
                  Position
                </th>
                <th className="apps-table__th apps-table__th--ort">Ort</th>
                <th className="apps-table__th apps-table__th--gehalt">
                  Gehalt
                </th>
                <th className="apps-table__th apps-table__th--status">
                  Status
                </th>
                <th className="apps-table__th apps-table__th--versand">
                  Versand
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, i) => (
                <ApplicationRow
                  key={app._id}
                  app={app}
                  index={i}
                  onNavigate={() => navigate(`/bewerbungen/${app._id}`)}
                  onEdit={(e) => {
                    e.stopPropagation();
                    setDialog({ mode: "edit", application: app });
                  }}
                  onToggleFavorite={(e) => handleToggleFavorite(e, app)}
                />
              ))}
            </tbody>
          </table>
          <p className="apps-count">
            {String(filtered.length).padStart(2, "0")} /{" "}
            {String(applications.length).padStart(2, "0")} Bewerbungen
          </p>
        </>
      )}

      <ApplicationFormDialog
        open={dialog !== null}
        defaultValues={
          dialog?.mode === "edit" ? dialog.application : undefined
        }
        onClose={closeDialog}
        onSubmit={(data) =>
          dialog?.mode === "edit"
            ? handleUpdate(dialog.application._id, data)
            : handleCreate(data)
        }
      />
    </div>
  );
}

/* ── Tabellenzeile ──────────────────────────────────────────── */

interface RowProps {
  app: Application;
  index: number;
  onNavigate: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

function ApplicationRow({
  app,
  index,
  onNavigate,
  onToggleFavorite,
}: RowProps) {
  const avatarName = app.company?.name ?? app.name;

  return (
    <tr className="apps-table__row" onClick={onNavigate}>
      <td className="apps-table__td apps-table__td--nr">
        {String(index + 1).padStart(2, "0")}
      </td>

      <td className="apps-table__td apps-table__td--position">
        <div className="apps-row-position">
          <span className="apps-row-avatar" aria-hidden="true">
            {initials(avatarName)}
          </span>
          <div className="apps-row-title">
            <span className="apps-row-title__name">{app.name}</span>
            {app.company?.name && (
              <span className="apps-row-title__company">{app.company.name}</span>
            )}
          </div>
        </div>
      </td>

      <td className="apps-table__td apps-table__td--ort">
        {(app.workLocation || app.workMode) && (
          <span className="apps-row-ort">
            <MapPin size={12} aria-hidden="true" />
            {[
              app.workLocation,
              app.workMode ? WORKMODE_LABELS[app.workMode] : undefined,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        )}
      </td>

      <td className="apps-table__td apps-table__td--gehalt">
        {formatSalary(app.salaryMin, app.salaryMax)}
      </td>

      <td className="apps-table__td apps-table__td--status">
        <span className="apps-status-badge" data-status={app.status}>
          {STATUS_LABELS[app.status] ?? app.status}
        </span>
      </td>

      <td className="apps-table__td apps-table__td--versand">
        <div className="apps-row-versand">
          <span className="apps-row-versand__date">
            {relativeTime(app.appliedAt)}
          </span>
          <button
            className={`apps-row-fav ${app.isFavorite ? "apps-row-fav--active" : ""}`}
            onClick={onToggleFavorite}
            aria-label={
              app.isFavorite
                ? "Aus Favoriten entfernen"
                : "Als Favorit markieren"
            }
          >
            <Star size={13} />
          </button>
          <ChevronRight size={16} className="apps-row-chevron" aria-hidden="true" />
        </div>
      </td>
    </tr>
  );
}

/* ── Leerer Zustand ─────────────────────────────────────────── */

function ApplicationsEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="apps-empty">
      <span className="apps-empty__icon" aria-hidden="true">
        <Briefcase size={28} />
      </span>
      <p className="apps-empty__heading">Noch keine Bewerbungen</p>
      <p className="apps-empty__sub">
        Lege deine erste Bewerbung an und behalte den Überblick.
      </p>
      <button className="btn btn-primary" onClick={onAdd}>
        Bewerbung anlegen
      </button>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────── */

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0] ?? "").slice(0, 2).toUpperCase();
  return (((parts[0] ?? "")[0] ?? "") + ((parts[1] ?? "")[0] ?? "")).toUpperCase();
}

function formatSalary(min?: number, max?: number): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE").format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)} €`;
  if (min) return `ab ${fmt(min)} €`;
  if (max) return `bis ${fmt(max)} €`;
  return "–";
}

function relativeTime(dateString?: string): string {
  if (!dateString) return "–";
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "heute";
  if (days === 1) return "gestern";
  if (days < 31) return `vor ${days} T.`;
  const months = Math.floor(days / 30);
  return `vor ${months} Mon.`;
}
