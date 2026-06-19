import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ExternalLink, Mail, Pencil, Phone, Plus, Trash2, UserRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Company, Contact, CreateContactInput } from "@jobflow/shared";
import { createContactSchema } from "@jobflow/shared";
import { contactsApi } from "@/lib/contacts.api";
import { companiesApi } from "@/lib/companies.api";
import { useUiStore } from "@/stores/ui.store";

type DialogState = null | { mode: "create" } | { mode: "edit"; contact: Contact };

export default function Contacts() {
  const setPageMeta = useUiStore((s) => s.setPageMeta);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "error" | "done">("loading");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => setDialog({ mode: "create" });
  const closeDialog = () => setDialog(null);

  useEffect(() => {
    setPageMeta({
      title: "Kontakte",
      subtitle: "Ansprechpartner & Netzwerk",
      metaTitle: "Kontakte | JobVault",
      metaDescription: "Alle Kontakte in deiner Bewerbungsdatenbank.",
      action: { label: "Kontakt anlegen", onClick: openCreate },
    });
  }, [setPageMeta]);

  useEffect(() => {
    Promise.all([contactsApi.getAll(), companiesApi.getAll()])
      .then(([contactsData, companiesData]) => {
        setContacts(contactsData);
        setCompanies(companiesData);
        setLoadState("done");
      })
      .catch(() => setLoadState("error"));
  }, []);

  const companyMap = Object.fromEntries(companies.map((c) => [c._id, c]));

  const handleCreate = async (data: CreateContactInput) => {
    const contact = await contactsApi.create(data);
    setContacts((prev) => [...prev, contact]);
    closeDialog();
    toast.success(`${contact.name} wurde angelegt.`);
  };

  const handleUpdate = async (id: string, data: CreateContactInput) => {
    const updated = await contactsApi.update(id, data);
    setContacts((prev) => prev.map((c) => (c._id === id ? updated : c)));
    closeDialog();
    toast.success(`${updated.name} wurde aktualisiert.`);
  };

  const handleDelete = async (id: string) => {
    const contact = contacts.find((c) => c._id === id);
    await contactsApi.remove(id);
    setContacts((prev) => prev.filter((c) => c._id !== id));
    setDeletingId(null);
    toast.success(`${contact?.name ?? "Kontakt"} wurde gelöscht.`);
  };

  return (
    <div>
      {loadState === "loading" && (
        <p className="contacts-feedback">Lade Kontakte …</p>
      )}
      {loadState === "error" && (
        <p className="contacts-feedback contacts-feedback--error">
          Kontakte konnten nicht geladen werden.
        </p>
      )}
      {loadState === "done" && contacts.length === 0 && <ContactsEmpty />}
      {loadState === "done" && contacts.length > 0 && (
        <ul className="contacts-list">
          {contacts.map((contact) => (
            <ContactCard
              key={contact._id}
              contact={contact}
              company={contact.company ? companyMap[contact.company] : undefined}
              isConfirmingDelete={deletingId === contact._id}
              onEdit={() => setDialog({ mode: "edit", contact })}
              onDeleteRequest={() => setDeletingId(contact._id)}
              onDeleteConfirm={() => handleDelete(contact._id)}
              onDeleteCancel={() => setDeletingId(null)}
            />
          ))}
        </ul>
      )}

      <ContactFormDialog
        open={dialog !== null}
        defaultValues={dialog?.mode === "edit" ? dialog.contact : undefined}
        companies={companies}
        onClose={closeDialog}
        onSubmit={(data) =>
          dialog?.mode === "edit"
            ? handleUpdate(dialog.contact._id, data)
            : handleCreate(data)
        }
      />
    </div>
  );
}

/* ── Karte ──────────────────────────────────────────────────── */

interface ContactCardProps {
  contact: Contact;
  company?: Company;
  isConfirmingDelete: boolean;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

function ContactCard({
  contact,
  company,
  isConfirmingDelete,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: ContactCardProps) {
  return (
    <li className="contact-card">
      <span className="contact-card__avatar" aria-hidden="true">
        {nameInitials(contact.name ?? "")}
      </span>

      <div className="contact-card__body">
        <div className="contact-card__top">
          <p className="contact-card__name">{contact.name}</p>
          {contact.position && (
            <span className="contact-card__position">{contact.position}</span>
          )}
          {company && (
            <span className="contact-card__company">{company.name}</span>
          )}
        </div>
        <div className="contact-card__links">
          <a href={`mailto:${contact.email}`} className="contact-card__link">
            <Mail size={12} />
            {contact.email}
          </a>
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="contact-card__link">
              <Phone size={12} />
              {contact.phone}
            </a>
          )}
          {contact.linkedIn && (
            <a
              href={contact.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card__link"
            >
              <ExternalLink size={12} />
              LinkedIn
            </a>
          )}
        </div>
      </div>

      <div className="contact-card__actions">
        {isConfirmingDelete ? (
          <>
            <span className="company-card__delete-label">Löschen?</span>
            <button
              className="btn btn-sm company-card__action-btn company-card__action-btn--danger"
              onClick={onDeleteConfirm}
            >
              Ja
            </button>
            <button
              className="btn btn-sm company-card__action-btn"
              onClick={onDeleteCancel}
            >
              Nein
            </button>
          </>
        ) : (
          <>
            <button
              className="company-card__icon-btn"
              onClick={onEdit}
              aria-label={`${contact.name} bearbeiten`}
            >
              <Pencil size={14} />
            </button>
            <button
              className="company-card__icon-btn company-card__icon-btn--danger"
              onClick={onDeleteRequest}
              aria-label={`${contact.name} löschen`}
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

/* ── Formular-Dialog ────────────────────────────────────────── */

interface ContactFormDialogProps {
  open: boolean;
  defaultValues?: Partial<CreateContactInput>;
  companies: Company[];
  onClose: () => void;
  onSubmit: (data: CreateContactInput) => Promise<void>;
}

function ContactFormDialog({
  open,
  defaultValues,
  companies,
  onClose,
  onSubmit,
}: ContactFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateContactInput>({
    resolver: zodResolver(createContactSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) reset(defaultValues ?? {});
  }, [open, defaultValues]);

  const submit = async (data: CreateContactInput) => {
    try {
      const cleaned: CreateContactInput = {
        ...data,
        phone: data.phone || undefined,
        company: data.company || undefined,
        linkedIn: data.linkedIn || undefined,
      };
      await onSubmit(cleaned);
    } catch {
      toast.error("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    }
  };

  const isEdit = defaultValues !== undefined;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="company-dialog">
        <DialogHeader className="company-dialog__header">
          <p className="company-dialog__eyebrow">Kontakt</p>
          <DialogTitle className="company-dialog__title">
            {isEdit ? "Kontakt bearbeiten" : "Neuer Kontakt"}
          </DialogTitle>
          <DialogDescription className="company-dialog__desc">
            Lege einen Ansprechpartner an, um ihn mit Firmen und Bewerbungen zu verknüpfen.
          </DialogDescription>
        </DialogHeader>

        <form className="formbody" onSubmit={handleSubmit(submit)} noValidate>
          <div className="widget">
            <label htmlFor="ctf-name" className="company-dialog__label">
              Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="ctf-name"
              {...register("name")}
              className={errors.name ? "error" : ""}
              placeholder="z. B. Maria Muster"
              autoComplete="name"
            />
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </div>

          <div className="widget">
            <label htmlFor="ctf-email" className="company-dialog__label">
              E-Mail <span aria-hidden="true">*</span>
            </label>
            <input
              id="ctf-email"
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
              <label htmlFor="ctf-position" className="company-dialog__label">
                Position
              </label>
              <input
                id="ctf-position"
                {...register("position")}
                className={errors.position ? "error" : ""}
                placeholder="z. B. HR Manager"
              />
              {errors.position && (
                <span className="error-message">{errors.position.message}</span>
              )}
            </div>
            <div className="widget">
              <label htmlFor="ctf-phone" className="company-dialog__label">
                Telefon
              </label>
              <input
                id="ctf-phone"
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
            <label htmlFor="ctf-linkedin" className="company-dialog__label">
              LinkedIn
            </label>
            <input
              id="ctf-linkedin"
              {...register("linkedIn")}
              className={errors.linkedIn ? "error" : ""}
              type="url"
              placeholder="https://linkedin.com/in/…"
            />
            {errors.linkedIn && (
              <span className="error-message">{errors.linkedIn.message}</span>
            )}
          </div>

          <div className="widget">
            <label htmlFor="ctf-company" className="company-dialog__label">
              Firma
            </label>
            <select
              id="ctf-company"
              {...register("company")}
              className={errors.company ? "error" : ""}
            >
              <option value="">— Keine Firma —</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.company && (
              <span className="error-message">{errors.company.message}</span>
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
              {isSubmitting
                ? "Speichern …"
                : isEdit
                  ? "Speichern"
                  : "Kontakt anlegen"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Leerer Zustand ─────────────────────────────────────────── */

function ContactsEmpty() {
  return (
    <div className="companies-empty">
      <span className="companies-empty__icon" aria-hidden="true">
        <UserRound size={28} />
      </span>
      <p className="companies-empty__heading">Noch keine Kontakte angelegt</p>
      <p className="companies-empty__sub">
        Lege deinen ersten Kontakt an, um ihn mit Firmen und Bewerbungen zu verknüpfen.
      </p>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────── */

function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? "";
  if (parts.length === 1) return (first[0] ?? "?").toUpperCase();
  const last = parts[parts.length - 1] ?? "";
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase();
}
