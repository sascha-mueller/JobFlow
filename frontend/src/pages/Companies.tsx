import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, ExternalLink, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Company, CreateCompanyInput } from "@jobflow/shared";
import { createCompanySchema } from "@jobflow/shared";
import { companiesApi } from "@/lib/companies.api";
import { useUiStore } from "@/stores/ui.store";

type DialogState = null | { mode: "create" } | { mode: "edit"; company: Company };

export default function Companies() {
  const setPageMeta = useUiStore((s) => s.setPageMeta);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "error" | "done">("loading");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => setDialog({ mode: "create" });
  const closeDialog = () => setDialog(null);

  useEffect(() => {
    setPageMeta({
      title: "Firmen",
      subtitle: "Adressen & Kontakte",
      metaTitle: "Firmen | JobVault",
      metaDescription: "Alle Firmen in deiner Bewerbungsdatenbank.",
      action: { label: "Firma anlegen", onClick: openCreate },
    });
  }, [setPageMeta]);

  useEffect(() => {
    companiesApi
      .getAll()
      .then((data) => {
        setCompanies(data);
        setLoadState("done");
      })
      .catch(() => setLoadState("error"));
  }, []);

  const handleCreate = async (data: CreateCompanyInput) => {
    const company = await companiesApi.create(data);
    setCompanies((prev) => [...prev, company]);
    closeDialog();
    toast.success(`${company.name} wurde angelegt.`);
  };

  const handleUpdate = async (id: string, data: CreateCompanyInput) => {
    const updated = await companiesApi.update(id, data);
    setCompanies((prev) => prev.map((c) => (c._id === id ? updated : c)));
    closeDialog();
    toast.success(`${updated.name} wurde aktualisiert.`);
  };

  const handleDelete = async (id: string) => {
    const company = companies.find((c) => c._id === id);
    await companiesApi.remove(id);
    setCompanies((prev) => prev.filter((c) => c._id !== id));
    setDeletingId(null);
    toast.success(`${company?.name ?? "Firma"} wurde gelöscht.`);
  };

  return (
    <div>
      {loadState === "loading" && (
        <p className="companies-feedback">Lade Firmen …</p>
      )}
      {loadState === "error" && (
        <p className="companies-feedback companies-feedback--error">
          Firmen konnten nicht geladen werden.
        </p>
      )}
      {loadState === "done" && companies.length === 0 && <CompaniesEmpty />}
      {loadState === "done" && companies.length > 0 && (
        <ul className="companies-list">
          {companies.map((company) => (
            <CompanyCard
              key={company._id}
              company={company}
              isConfirmingDelete={deletingId === company._id}
              onEdit={() => setDialog({ mode: "edit", company })}
              onDeleteRequest={() => setDeletingId(company._id)}
              onDeleteConfirm={() => handleDelete(company._id)}
              onDeleteCancel={() => setDeletingId(null)}
            />
          ))}
        </ul>
      )}

      <CompanyFormDialog
        open={dialog !== null}
        defaultValues={dialog?.mode === "edit" ? dialog.company : undefined}
        onClose={closeDialog}
        onSubmit={(data) =>
          dialog?.mode === "edit"
            ? handleUpdate(dialog.company._id, data)
            : handleCreate(data)
        }
      />
    </div>
  );
}

/* ── Karte ──────────────────────────────────────────────────── */

interface CompanyCardProps {
  company: Company;
  isConfirmingDelete: boolean;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

function CompanyCard({
  company,
  isConfirmingDelete,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: CompanyCardProps) {
  return (
    <li className="company-card">
      <span className="company-card__icon" aria-hidden="true">
        <Building2 size={18} />
      </span>

      <Link to={`/firmen/${company._id}`} className="company-card__body">
        <p className="company-card__name">{company.name}</p>
        <p className="company-card__address">
          <MapPin size={12} />
          {company.street}, {company.zip} {company.city}
        </p>
        {company.notes && (
          <p className="company-card__notes">{company.notes}</p>
        )}
      </Link>

      <div className="company-card__actions">
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
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="company-card__icon-btn"
                aria-label={`Website von ${company.name} öffnen`}
              >
                <ExternalLink size={14} />
              </a>
            )}
            <button
              className="company-card__icon-btn"
              onClick={onEdit}
              aria-label={`${company.name} bearbeiten`}
            >
              <Pencil size={14} />
            </button>
            <button
              className="company-card__icon-btn company-card__icon-btn--danger"
              onClick={onDeleteRequest}
              aria-label={`${company.name} löschen`}
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

interface CompanyFormDialogProps {
  open: boolean;
  defaultValues?: Partial<CreateCompanyInput>;
  onClose: () => void;
  onSubmit: (data: CreateCompanyInput) => Promise<void>;
}

function CompanyFormDialog({
  open,
  defaultValues,
  onClose,
  onSubmit,
}: CompanyFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCompanyInput>({
    resolver: zodResolver(createCompanySchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) reset(defaultValues ?? {});
  }, [open, defaultValues]);

  const submit = async (data: CreateCompanyInput) => {
    try {
      await onSubmit(data);
    } catch {
      toast.error("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    }
  };

  const isEdit = defaultValues !== undefined;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="company-dialog">
        <DialogHeader className="company-dialog__header">
          <p className="company-dialog__eyebrow">Eintrag anlegen</p>
          <DialogTitle className="company-dialog__title">
            {isEdit ? "Firma bearbeiten" : "Neue Firma"}
          </DialogTitle>
          <DialogDescription className="company-dialog__desc">
            Lege eine Firma an, um Bewerbungen und Ansprechpartner zuzuordnen.
          </DialogDescription>
        </DialogHeader>

        <form className="formbody" onSubmit={handleSubmit(submit)} noValidate>
          <div className="widget">
            <label htmlFor="cf-name" className="company-dialog__label">
              Firmenname <span aria-hidden="true">*</span>
            </label>
            <input
              id="cf-name"
              {...register("name")}
              className={errors.name ? "error" : ""}
              placeholder="z. B. Lumen Studio"
              autoComplete="organization"
            />
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </div>

          <div className="company-dialog__row">
            <div className="widget">
              <label htmlFor="cf-street" className="company-dialog__label">
                Straße
              </label>
              <input
                id="cf-street"
                {...register("street")}
                className={errors.street ? "error" : ""}
                placeholder="z. B. Musterstr. 12"
              />
              {errors.street && (
                <span className="error-message">{errors.street.message}</span>
              )}
            </div>
            <div className="widget">
              <label htmlFor="cf-city" className="company-dialog__label">
                Standort
              </label>
              <input
                id="cf-city"
                {...register("city")}
                className={errors.city ? "error" : ""}
                placeholder="z. B. Berlin"
              />
              {errors.city && (
                <span className="error-message">{errors.city.message}</span>
              )}
            </div>
          </div>

          <div className="widget">
            <label htmlFor="cf-zip" className="company-dialog__label">
              PLZ
            </label>
            <input
              id="cf-zip"
              {...register("zip")}
              className={errors.zip ? "error" : ""}
              placeholder="10115"
            />
            {errors.zip && (
              <span className="error-message">{errors.zip.message}</span>
            )}
          </div>

          <div className="widget">
            <label htmlFor="cf-website" className="company-dialog__label">
              Website
            </label>
            <input
              id="cf-website"
              {...register("website")}
              className={errors.website ? "error" : ""}
              type="url"
              placeholder="firma.de"
            />
            {errors.website && (
              <span className="error-message">{errors.website.message}</span>
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
                  : "Firma anlegen"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Leerer Zustand ─────────────────────────────────────────── */

function CompaniesEmpty() {
  return (
    <div className="companies-empty">
      <span className="companies-empty__icon" aria-hidden="true">
        <Building2 size={28} />
      </span>
      <p className="companies-empty__heading">Noch keine Firmen angelegt</p>
      <p className="companies-empty__sub">
        Lege deine erste Firma an, um sie später mit Bewerbungen zu verknüpfen.
      </p>
    </div>
  );
}
