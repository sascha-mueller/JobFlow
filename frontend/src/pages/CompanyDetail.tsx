import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ExternalLink, Mail, MapPin, Phone, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Company, Contact } from "@jobflow/shared";
import { companiesApi } from "@/lib/companies.api";
import { contactsApi } from "@/lib/contacts.api";
import { useUiStore } from "@/stores/ui.store";

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setPageMeta = useUiStore((s) => s.setPageMeta);

  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "error" | "done">(
    "loading",
  );
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/firmen");
      return;
    }
    Promise.all([companiesApi.getById(id), contactsApi.getAll()])
      .then(([comp, allContacts]) => {
        setCompany(comp);
        setContacts(allContacts.filter((c) => c.company === id));
        setLoadState("done");
      })
      .catch(() => setLoadState("error"));
  }, [id]);

  useEffect(() => {
    if (!company) return;
    setPageMeta({
      title: company.name,
      subtitle: "",
      metaTitle: `${company.name} | JobVault`,
      metaDescription: `Details zu ${company.name}`,
      backLink: { label: "Firmen", href: "/firmen" },
    });
  }, [company, setPageMeta]);

  if (loadState === "loading") {
    return <p className="cd-feedback">Lade …</p>;
  }
  if (loadState === "error" || !company) {
    return (
      <p className="cd-feedback cd-feedback--error">
        Firma konnte nicht geladen werden.
      </p>
    );
  }

  const addressParts = [
    company.street,
    [company.zip, company.city].filter(Boolean).join(" "),
  ].filter(Boolean);

  return (
    <div className="cd-page">
      <div className="cd-hero">
        <span className="cd-avatar" aria-hidden="true">
          {companyInitials(company.name)}
        </span>
        <div className="cd-hero__info">
          <h2 className="cd-name">{company.name}</h2>
          <div className="cd-meta">
            {addressParts.length > 0 && (
              <span className="cd-meta-item">
                <MapPin size={13} />
                {addressParts.join(", ")}
              </span>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="cd-meta-item cd-meta-item--link"
              >
                <ExternalLink size={13} />
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
          {company.notes && <p className="cd-notes">{company.notes}</p>}
        </div>
      </div>

      <div className="cd-grid">
        <ContactsPanel
          contacts={contacts}
          onAdd={() => setShowLinkDialog(true)}
        />
        <ApplicationsPanel />
      </div>

      <LinkContactDialog
        open={showLinkDialog}
        companyId={company._id}
        linkedIds={contacts.map((c) => c._id)}
        onClose={() => setShowLinkDialog(false)}
        onLinked={(contact) => setContacts((prev) => [...prev, contact])}
      />
    </div>
  );
}

/* ── Ansprechpartner-Panel ──────────────────────────────────── */

function ContactsPanel({
  contacts,
  onAdd,
}: {
  contacts: Contact[];
  onAdd: () => void;
}) {
  return (
    <div className="cd-panel">
      <div className="cd-panel__header">
        <span className="cd-panel__title">Ansprechpartner</span>
        <button
          className="btn btn-sm btn-ghost cd-panel__add-btn"
          onClick={onAdd}
        >
          <Plus size={14} />
          Hinzufügen
        </button>
      </div>

      {contacts.length === 0 ? (
        <p className="cd-empty">Noch keine Ansprechpartner für diese Firma.</p>
      ) : (
        <ul className="cd-contact-list">
          {contacts.map((contact) => (
            <li key={contact._id} className="cd-contact-item">
              <span className="cd-contact-avatar" aria-hidden="true">
                {nameInitials(contact.name ?? "")}
              </span>
              <div className="cd-contact-info">
                <p className="cd-contact-name">{contact.name}</p>
                <div className="cd-contact-links">
                  <a
                    href={`mailto:${contact.email}`}
                    className="cd-contact-link"
                  >
                    <Mail size={12} />
                    {contact.email}
                  </a>
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="cd-contact-link"
                    >
                      <Phone size={12} />
                      {contact.phone}
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Kontakt verknüpfen Dialog ──────────────────────────────── */

interface LinkContactDialogProps {
  open: boolean;
  companyId: string;
  linkedIds: string[];
  onClose: () => void;
  onLinked: (contact: Contact) => void;
}

function LinkContactDialog({
  open,
  companyId,
  linkedIds,
  onClose,
  onLinked,
}: LinkContactDialogProps) {
  const [available, setAvailable] = useState<Contact[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "done" | "error">(
    "loading",
  );
  const [linkingId, setLinkingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoadState("loading");
    contactsApi
      .getAll()
      .then((all) => {
        setAvailable(all.filter((c) => !c.company && !linkedIds.includes(c._id)));
        setLoadState("done");
      })
      .catch(() => setLoadState("error"));
  }, [open]);

  const handleLink = async (contact: Contact) => {
    setLinkingId(contact._id);
    try {
      const updated = await contactsApi.update(contact._id, {
        company: companyId,
      });
      onLinked(updated);
      setAvailable((prev) => prev.filter((c) => c._id !== contact._id));
    } catch {
      toast.error("Kontakt konnte nicht zugeordnet werden.");
    } finally {
      setLinkingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="company-dialog">
        <DialogHeader className="company-dialog__header">
          <p className="company-dialog__eyebrow">Ansprechpartner</p>
          <DialogTitle className="company-dialog__title">
            Kontakt zuordnen
          </DialogTitle>
          <DialogDescription className="company-dialog__desc">
            Wähle einen bestehenden Kontakt aus, der dieser Firma zugeordnet
            werden soll.
          </DialogDescription>
        </DialogHeader>

        {loadState === "loading" && (
          <p className="cd-feedback">Lade Kontakte …</p>
        )}
        {loadState === "error" && (
          <p className="cd-feedback cd-feedback--error">
            Kontakte konnten nicht geladen werden.
          </p>
        )}
        {loadState === "done" && available.length === 0 && (
          <p className="cd-empty lc-empty">
            Keine freien Kontakte verfügbar. Lege zuerst einen Kontakt an.
          </p>
        )}
        {loadState === "done" && available.length > 0 && (
          <ul className="lc-list">
            {available.map((contact) => (
              <li key={contact._id} className="lc-item">
                <span className="cd-contact-avatar" aria-hidden="true">
                  {nameInitials(contact.name ?? "")}
                </span>
                <div className="lc-info">
                  <p className="cd-contact-name">{contact.name}</p>
                  <p className="lc-email">{contact.email}</p>
                </div>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleLink(contact)}
                  disabled={linkingId === contact._id}
                >
                  {linkingId === contact._id ? "…" : "Zuordnen"}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="company-dialog__footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Schließen
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Bewerbungen-Panel ──────────────────────────────────────── */

function ApplicationsPanel() {
  return (
    <div className="cd-panel">
      <div className="cd-panel__header">
        <span className="cd-panel__title">Bewerbungen</span>
      </div>
      <p className="cd-empty">Noch keine Bewerbungen verknüpft.</p>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────── */

function companyInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? "";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const second = parts[1] ?? "";
  return ((first[0] ?? "") + (second[0] ?? "")).toUpperCase();
}

function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? "";
  if (parts.length === 1) return (first[0] ?? "?").toUpperCase();
  const last = parts[parts.length - 1] ?? "";
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase();
}
