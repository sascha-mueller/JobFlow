import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  Calendar,
  Check,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Send,
} from "lucide-react";
import type { Application, CreateApplicationInput } from "@jobflow/shared";
import { applicationsApi } from "@/lib/applications.api";
import { useUiStore } from "@/stores/ui.store";
import ApplicationFormDialog, {
  STATUS_LABELS,
  WORKMODE_LABELS,
} from "@/components/ApplicationFormDialog";

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setPageMeta = useUiStore((s) => s.setPageMeta);

  const [app, setApp] = useState<Application | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "error" | "done">(
    "loading",
  );
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/bewerbungen");
      return;
    }
    applicationsApi
      .getById(id)
      .then((data) => {
        setApp(data);
        setLoadState("done");
      })
      .catch(() => setLoadState("error"));
  }, [id]);

  useEffect(() => {
    if (!app) return;
    setPageMeta({
      title: app.name,
      subtitle: app.company?.name ?? "",
      metaTitle: `${app.name} | JobVault`,
      metaDescription: `Details zur Bewerbung ${app.name}`,
      backLink: { label: "Bewerbungen", href: "/bewerbungen" },
    });
  }, [app, setPageMeta]);

  const handleUpdate = async (data: CreateApplicationInput) => {
    if (!app) return;
    const updated = await applicationsApi.update(app._id, data);
    setApp(updated);
    setEditOpen(false);
    toast.success("Bewerbung aktualisiert.");
  };

  if (loadState === "loading") {
    return <p className="apd-feedback">Lade …</p>;
  }
  if (loadState === "error" || !app) {
    return (
      <p className="apd-feedback apd-feedback--error">
        Bewerbung konnte nicht geladen werden.
      </p>
    );
  }

  const avatarName = app.company?.name ?? app.name;

  return (
    <div className="apd-page">
      {/* Hero-Header */}
      <div className="apd-hero">
        <span className="apd-hero__avatar" aria-hidden="true">
          {initials(avatarName)}
        </span>
        <div className="apd-hero__info">
          <div className="apd-hero__title-row">
            <h2 className="apd-hero__name">{app.name}</h2>
            <span className="apps-status-badge apd-hero__badge" data-status={app.status}>
              {STATUS_LABELS[app.status] ?? app.status}
            </span>
          </div>
          {app.company?.name && (
            <p className="apd-hero__company">{app.company.name}</p>
          )}
          <div className="apd-hero__meta">
            {app.workLocation && (
              <span className="apd-hero__meta-item">
                <MapPin size={13} />
                {app.workLocation}
              </span>
            )}
            {app.workMode && (
              <span className="apd-hero__meta-item">
                {WORKMODE_LABELS[app.workMode] ?? app.workMode}
              </span>
            )}
          </div>
        </div>
        <button
          className="btn btn-ghost apd-hero__edit-btn"
          onClick={() => setEditOpen(true)}
          aria-label="Bewerbung bearbeiten"
        >
          <Pencil size={15} />
          Bearbeiten
        </button>
      </div>

      {/* 2-Spalten-Grid */}
      <div className="apd-grid">
        {/* Linke Spalte */}
        <div className="apd-col-main">
          <DescriptionPanel app={app} />
          <ActivitiesPanel app={app} />
          <NotesPanel app={app} onSaved={(notes) => setApp({ ...app, notes })} />
        </div>

        {/* Rechte Spalte */}
        <div className="apd-col-side">
          <EckdatenPanel app={app} />
          {app.contact && <ContactPanel contact={app.contact} />}
        </div>
      </div>

      <ApplicationFormDialog
        open={editOpen}
        defaultValues={app}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
      />
    </div>
  );
}

/* ── Stellenbeschreibung ────────────────────────────────────── */

function DescriptionPanel({ app }: { app: Application }) {
  return (
    <div className="apd-panel">
      <div className="apd-panel__header">
        <span className="apd-panel__title">Stellenbeschreibung</span>
        {app.link && (
          <a
            href={app.link}
            target="_blank"
            rel="noopener noreferrer"
            className="apd-panel__action-link"
          >
            <ExternalLink size={13} />
            Zur Anzeige
          </a>
        )}
      </div>
      {app.description ? (
        <p className="apd-description">{app.description}</p>
      ) : (
        <p className="apd-empty">Noch keine Beschreibung hinterlegt.</p>
      )}
    </div>
  );
}

/* ── Aktivitäten ────────────────────────────────────────────── */

function ActivitiesPanel({ app }: { app: Application }) {
  return (
    <div className="apd-panel">
      <div className="apd-panel__header">
        <span className="apd-panel__title">Aktivitäten</span>
      </div>
      {app.appliedAt ? (
        <ul className="apd-activity-list">
          <li className="apd-activity-item">
            <span className="apd-activity-icon" aria-hidden="true">
              <Send size={14} />
            </span>
            <div className="apd-activity-body">
              <span className="apd-activity-label">Bewerbung abgeschickt</span>
              <span className="apd-activity-date">
                {formatDate(app.appliedAt)}
              </span>
            </div>
          </li>
        </ul>
      ) : (
        <p className="apd-empty">Noch keine Aktivitäten erfasst.</p>
      )}
    </div>
  );
}

/* ── Notizen (inline autosave) ──────────────────────────────── */

function NotesPanel({
  app,
  onSaved,
}: {
  app: Application;
  onSaved: (notes: string) => void;
}) {
  const [value, setValue] = useState(app.notes ?? "");
  const [saved, setSaved] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const notes = e.target.value;
    setValue(notes);
    setSaved(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await applicationsApi.update(app._id, { notes });
      setSaved(true);
      onSaved(notes);
    }, 1000);
  };

  return (
    <div className="apd-panel">
      <div className="apd-panel__header">
        <span className="apd-panel__title">Notizen</span>
        {saved && value !== "" && (
          <span className="apd-notes-saved">
            <Check size={12} />
            Gespeichert
          </span>
        )}
      </div>
      <textarea
        className="apd-notes-textarea"
        value={value}
        onChange={handleChange}
        placeholder="Eigene Notizen zur Bewerbung …"
        rows={5}
      />
    </div>
  );
}

/* ── Eckdaten ───────────────────────────────────────────────── */

function EckdatenPanel({ app }: { app: Application }) {
  return (
    <div className="apd-panel">
      <div className="apd-panel__header">
        <span className="apd-panel__title">Eckdaten</span>
      </div>
      <dl className="apd-eckdaten">
        {(app.salaryMin || app.salaryMax) && (
          <EckdatenRow
            icon={<span aria-hidden="true">€</span>}
            label="GEHALT"
            value={formatSalary(app.salaryMin, app.salaryMax)}
          />
        )}
        {app.appliedAt && (
          <EckdatenRow
            icon={<Calendar size={13} />}
            label="BEWORBEN"
            value={formatDate(app.appliedAt)}
          />
        )}
        {app.deadline && (
          <EckdatenRow
            icon={<Calendar size={13} />}
            label="FRIST"
            value={formatDate(app.deadline)}
          />
        )}
        {app.workMode && (
          <EckdatenRow
            icon={<MapPin size={13} />}
            label="MODELL"
            value={WORKMODE_LABELS[app.workMode] ?? app.workMode}
          />
        )}
        {!app.salaryMin && !app.salaryMax && !app.appliedAt && !app.workMode && (
          <p className="apd-empty">Keine Eckdaten hinterlegt.</p>
        )}
      </dl>
    </div>
  );
}

function EckdatenRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="apd-eckdaten__row">
      <dt className="apd-eckdaten__label">
        <span className="apd-eckdaten__icon" aria-hidden="true">
          {icon}
        </span>
        {label}
      </dt>
      <dd className="apd-eckdaten__value">{value}</dd>
    </div>
  );
}

/* ── Kontaktperson ──────────────────────────────────────────── */

function ContactPanel({
  contact,
}: {
  contact: NonNullable<Application["contact"]>;
}) {
  return (
    <div className="apd-panel">
      <div className="apd-panel__header">
        <span className="apd-panel__title">Kontaktperson</span>
      </div>
      <div className="apd-contact">
        <span className="apd-contact__avatar" aria-hidden="true">
          {initials(contact.name)}
        </span>
        <div className="apd-contact__info">
          <span className="apd-contact__name">{contact.name}</span>
          {contact.position && (
            <span className="apd-contact__position">{contact.position}</span>
          )}
        </div>
      </div>
      <div className="apd-contact__links">
        <a href={`mailto:${contact.email}`} className="apd-contact__link">
          <Mail size={13} />
          {contact.email}
        </a>
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="apd-contact__link">
            <Phone size={13} />
            {contact.phone}
          </a>
        )}
        {contact.linkedIn && (
          <a
            href={contact.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="apd-contact__link"
          >
            <ExternalLink size={13} />
            LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────── */

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0] ?? "").slice(0, 2).toUpperCase();
  return (((parts[0] ?? "")[0] ?? "") + ((parts[1] ?? "")[0] ?? "")).toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatSalary(min?: number, max?: number): string {
  const fmt = (n: number) => new Intl.NumberFormat("de-DE").format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)} €`;
  if (min) return `ab ${fmt(min)} €`;
  if (max) return `bis ${fmt(max)} €`;
  return "–";
}
