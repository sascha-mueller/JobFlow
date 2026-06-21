import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import type { Company, Contact, CreateContactInput } from "@jobflow/shared";
import { createContactSchema } from "@jobflow/shared";
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
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (!id) {
      navigate("/firmen");
      return;
    }
    Promise.all([companiesApi.getById(id), contactsApi.getAll()])
      .then(([comp, fetched]) => {
        setCompany(comp);
        setAllContacts(fetched);
        const linked = fetched.filter((c) => c.company === id);
        const primaryId = comp.contact?._id;
        const hasPrimary = primaryId && linked.some((c) => c._id === primaryId);
        const primary = !hasPrimary && primaryId
          ? fetched.find((c) => c._id === primaryId)
          : undefined;
        setContacts(primary ? [primary, ...linked] : linked);
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
          onLink={() => setShowSelectDialog(true)}
        />
        <ApplicationsPanel />
      </div>

      <AddContactDialog
        open={showLinkDialog}
        companyId={company._id}
        companyName={company.name}
        onClose={() => setShowLinkDialog(false)}
        onCreated={(contact) => setContacts((prev) => [...prev, contact])}
      />

      <SelectContactDialog
        open={showSelectDialog}
        contacts={allContacts.filter(
          (c) => !contacts.some((linked) => linked._id === c._id),
        )}
        onClose={() => setShowSelectDialog(false)}
        onSelect={async (contactId) => {
          const updated = await companiesApi.update(company._id, { contact: contactId });
          setCompany(updated);
          const selected = allContacts.find((c) => c._id === contactId);
          if (selected) setContacts((prev) => [selected, ...prev]);
          setShowSelectDialog(false);
        }}
      />
    </div>
  );
}

/* ── Ansprechpartner-Panel ──────────────────────────────────── */

function ContactsPanel({
  contacts,
  onAdd,
  onLink,
}: {
  contacts: Contact[];
  onAdd: () => void;
  onLink: () => void;
}) {
  return (
    <div className="cd-panel">
      <div className="cd-panel__header">
        <span className="cd-panel__title">Ansprechpartner</span>
        <div style={{ display: "flex", gap: "0.375rem" }}>
          <button
            className="btn btn-sm btn-ghost cd-panel__add-btn"
            onClick={onLink}
          >
            Verknüpfen
          </button>
          <button
            className="btn btn-sm btn-ghost cd-panel__add-btn"
            onClick={onAdd}
          >
            <Plus size={14} />
            Neu anlegen
          </button>
        </div>
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
                {contact.position && (
                  <p className="cd-contact-position">{contact.position}</p>
                )}
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
                  {contact.linkedIn && (
                    <a
                      href={contact.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cd-contact-link"
                    >
                      <ExternalLink size={12} />
                      LinkedIn
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

/* ── Kontakt anlegen Dialog ─────────────────────────────────── */

interface AddContactDialogProps {
  open: boolean;
  companyId: string;
  companyName: string;
  onClose: () => void;
  onCreated: (contact: Contact) => void;
}

function AddContactDialog({
  open,
  companyId,
  companyName,
  onClose,
  onCreated,
}: AddContactDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateContactInput>({
    resolver: zodResolver(createContactSchema),
    defaultValues: { company: companyId },
  });

  useEffect(() => {
    if (open) reset({ company: companyId });
  }, [open, companyId]);

  const submit = async (data: CreateContactInput) => {
    try {
      const contact = await contactsApi.create({
        ...data,
        phone: data.phone || undefined,
        linkedIn: data.linkedIn || undefined,
        company: companyId,
      });
      onCreated(contact);
      onClose();
      toast.success(`${contact.name} wurde angelegt.`);
    } catch {
      toast.error("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="company-dialog">
        <DialogHeader className="company-dialog__header">
          <p className="company-dialog__eyebrow">{companyName}</p>
          <DialogTitle className="company-dialog__title">
            Ansprechpartner anlegen
          </DialogTitle>
          <DialogDescription className="company-dialog__desc">
            Neuer Kontakt wird direkt dieser Firma zugeordnet.
          </DialogDescription>
        </DialogHeader>

        <form className="formbody" onSubmit={handleSubmit(submit)} noValidate>
          <div className="widget">
            <label htmlFor="acd-name" className="company-dialog__label">
              Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="acd-name"
              {...register("name")}
              className={errors.name ? "error" : ""}
              placeholder="z. B. Maria Muster"
              autoComplete="name"
              autoFocus
            />
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </div>

          <div className="widget">
            <label htmlFor="acd-email" className="company-dialog__label">
              E-Mail <span aria-hidden="true">*</span>
            </label>
            <input
              id="acd-email"
              {...register("email")}
              className={errors.email ? "error" : ""}
              type="email"
              placeholder="maria@beispiel.de"
              autoComplete="email"
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="company-dialog__row">
            <div className="widget">
              <label htmlFor="acd-position" className="company-dialog__label">
                Position
              </label>
              <input
                id="acd-position"
                {...register("position")}
                className={errors.position ? "error" : ""}
                placeholder="z. B. HR Manager"
              />
              {errors.position && (
                <span className="error-message">{errors.position.message}</span>
              )}
            </div>
            <div className="widget">
              <label htmlFor="acd-phone" className="company-dialog__label">
                Telefon
              </label>
              <input
                id="acd-phone"
                {...register("phone")}
                className={errors.phone ? "error" : ""}
                type="tel"
                placeholder="+49 30 12345678"
                autoComplete="tel"
              />
              {errors.phone && (
                <span className="error-message">{errors.phone.message}</span>
              )}
            </div>
          </div>

          <div className="widget">
            <label htmlFor="acd-linkedin" className="company-dialog__label">
              LinkedIn
            </label>
            <input
              id="acd-linkedin"
              {...register("linkedIn")}
              className={errors.linkedIn ? "error" : ""}
              type="url"
              placeholder="https://linkedin.com/in/…"
            />
            {errors.linkedIn && (
              <span className="error-message">{errors.linkedIn.message}</span>
            )}
          </div>

          <div className="company-dialog__footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <Plus size={16} aria-hidden="true" />
              {isSubmitting ? "Speichern …" : "Kontakt anlegen"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Bestehenden Kontakt verknüpfen ─────────────────────────── */

function SelectContactDialog({
  open,
  contacts,
  onClose,
  onSelect,
}: {
  open: boolean;
  contacts: Contact[];
  onClose: () => void;
  onSelect: (contactId: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setSelected("");
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await onSelect(selected);
    } catch {
      toast.error("Verknüpfen fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="company-dialog">
        <DialogHeader className="company-dialog__header">
          <p className="company-dialog__eyebrow">Ansprechpartner</p>
          <DialogTitle className="company-dialog__title">
            Bestehenden Kontakt verknüpfen
          </DialogTitle>
          <DialogDescription className="company-dialog__desc">
            Wähle einen vorhandenen Kontakt aus deiner Liste.
          </DialogDescription>
        </DialogHeader>
        <form className="formbody" onSubmit={handleSubmit} noValidate>
          <div className="widget">
            <label htmlFor="sc-contact" className="company-dialog__label">
              Kontakt <span aria-hidden="true">*</span>
            </label>
            <select
              id="sc-contact"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              required
            >
              <option value="">– Kontakt wählen –</option>
              {contacts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}{c.position ? ` · ${c.position}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="company-dialog__footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={saving}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selected || saving}
            >
              {saving ? "Speichern …" : "Verknüpfen"}
            </button>
          </div>
        </form>
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
