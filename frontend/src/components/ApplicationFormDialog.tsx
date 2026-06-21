import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Application, Company, CreateApplicationInput } from "@jobflow/shared";
import { createApplicationSchema, ApplicationStatus, WorkMode } from "@jobflow/shared";
import { companiesApi } from "@/lib/companies.api";

export const STATUS_LABELS: Record<string, string> = {
  WATCHLIST: "Merkliste",
  DRAFT: "Entwurf",
  SENT: "Eingereicht",
  INTERVIEW: "Im Gespräch",
  OFFER: "Angebot",
  ACCEPTED: "Angenommen",
  REJECTED: "Abgesagt",
};

export const WORKMODE_LABELS: Record<string, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "Vor Ort",
};

interface Props {
  open: boolean;
  defaultValues?: Application;
  initialCompanyId?: string;
  onClose: () => void;
  onSubmit: (data: CreateApplicationInput) => Promise<void>;
}

function toFormDefaults(app?: Application, initialCompanyId?: string): Partial<CreateApplicationInput> {
  if (!app) return { status: "WATCHLIST", isFavorite: false, company: initialCompanyId };
  return {
    name: app.name,
    description: app.description ?? "",
    salaryMin: app.salaryMin,
    salaryMax: app.salaryMax,
    link: app.link,
    isFavorite: app.isFavorite,
    status: app.status,
    company: app.company?._id,
    contact: app.contact?._id,
    workLocation: app.workLocation,
    workMode: app.workMode,
    appliedAt: app.appliedAt ? app.appliedAt.slice(0, 10) : undefined,
    deadline: app.deadline ? app.deadline.slice(0, 10) : undefined,
    followUpAt: app.followUpAt ? app.followUpAt.slice(0, 10) : undefined,
    notes: app.notes,
  };
}

export default function ApplicationFormDialog({
  open,
  defaultValues,
  initialCompanyId,
  onClose,
  onSubmit,
}: Props) {
  const isEdit = defaultValues !== undefined;
  const [companies, setCompanies] = useState<Company[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<CreateApplicationInput>({
    resolver: zodResolver(createApplicationSchema) as any,
    defaultValues: toFormDefaults(defaultValues, initialCompanyId),
  });

  useEffect(() => {
    if (open) reset(toFormDefaults(defaultValues, initialCompanyId));
  }, [open, defaultValues, initialCompanyId]);

  useEffect(() => {
    companiesApi.getAll().then(setCompanies).catch(() => {});
  }, []);

  const submit = async (data: CreateApplicationInput) => {
    try {
      await onSubmit(data);
    } catch {
      toast.error("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="app-dialog">
        <DialogHeader className="company-dialog__header">
          <p className="company-dialog__eyebrow">Bewerbung</p>
          <DialogTitle className="company-dialog__title">
            {isEdit ? "Bewerbung bearbeiten" : "Neue Bewerbung"}
          </DialogTitle>
          <DialogDescription className="company-dialog__desc">
            Trage die Stelle ein und wähle einen Status.
          </DialogDescription>
        </DialogHeader>

        <form className="formbody" onSubmit={handleSubmit(submit)} noValidate>
          <div className="widget">
            <label htmlFor="af-name" className="company-dialog__label">
              Stelle <span aria-hidden="true">*</span>
            </label>
            <input
              id="af-name"
              {...register("name")}
              className={errors.name ? "error" : ""}
              placeholder="z. B. Frontend Developer"
              autoFocus
            />
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </div>

          <div className="widget">
            <label htmlFor="af-company" className="company-dialog__label">
              Firma
            </label>
            <select
              id="af-company"
              {...register("company", {
                setValueAs: (v) => (v === "" ? undefined : v),
              })}
            >
              <option value="">– keine Angabe –</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="widget">
            <label htmlFor="af-status" className="company-dialog__label">
              Status <span aria-hidden="true">*</span>
            </label>
            <select
              id="af-status"
              {...register("status")}
              className={errors.status ? "error" : ""}
            >
              {ApplicationStatus.options.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s] ?? s}
                </option>
              ))}
            </select>
            {errors.status && (
              <span className="error-message">{errors.status.message}</span>
            )}
          </div>

          <div className="company-dialog__row">
            <div className="widget">
              <label htmlFor="af-workmode" className="company-dialog__label">
                Arbeitsmodell
              </label>
              <select
                id="af-workmode"
                {...register("workMode", {
                  setValueAs: (v) => (v === "" ? undefined : v),
                })}
              >
                <option value="">– keine Angabe –</option>
                {WorkMode.options.map((m) => (
                  <option key={m} value={m}>
                    {WORKMODE_LABELS[m] ?? m}
                  </option>
                ))}
              </select>
            </div>
            <div className="widget">
              <label htmlFor="af-location" className="company-dialog__label">
                Standort
              </label>
              <input
                id="af-location"
                {...register("workLocation")}
                placeholder="z. B. Berlin"
              />
            </div>
          </div>

          <div className="widget">
            <label htmlFor="af-description" className="company-dialog__label">
              Stellenbeschreibung
            </label>
            <textarea
              id="af-description"
              {...register("description")}
              placeholder="Kurzbeschreibung der Stelle …"
              rows={4}
            />
          </div>

          <div className="widget">
            <label htmlFor="af-link" className="company-dialog__label">
              Stellenanzeige (URL)
            </label>
            <input
              id="af-link"
              type="url"
              {...register("link", {
                setValueAs: (v) => {
                  if (!v || v.trim() === "") return undefined;
                  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
                },
              })}
              className={errors.link ? "error" : ""}
              placeholder="https://jobs.firma.de/stelle"
            />
            {errors.link && (
              <span className="error-message">{errors.link.message}</span>
            )}
          </div>

          <div className="company-dialog__row">
            <div className="widget">
              <label htmlFor="af-salarymin" className="company-dialog__label">
                Gehalt min. (€)
              </label>
              <input
                id="af-salarymin"
                type="number"
                min={0}
                placeholder="40000"
                {...register("salaryMin", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
            </div>
            <div className="widget">
              <label htmlFor="af-salarymax" className="company-dialog__label">
                Gehalt max. (€)
              </label>
              <input
                id="af-salarymax"
                type="number"
                min={0}
                placeholder="60000"
                {...register("salaryMax", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
            </div>
          </div>

          <div className="company-dialog__row">
            <div className="widget">
              <label htmlFor="af-applied" className="company-dialog__label">
                Beworben am
              </label>
              <input
                id="af-applied"
                type="date"
                {...register("appliedAt", {
                  setValueAs: (v) => (v === "" ? undefined : v),
                })}
              />
            </div>
            <div className="widget">
              <label htmlFor="af-deadline" className="company-dialog__label">
                Bewerbungsfrist
              </label>
              <input
                id="af-deadline"
                type="date"
                {...register("deadline", {
                  setValueAs: (v) => (v === "" ? undefined : v),
                })}
              />
            </div>
          </div>

          <div className="widget">
            <label htmlFor="af-notes" className="company-dialog__label">
              Notizen
            </label>
            <textarea
              id="af-notes"
              {...register("notes")}
              placeholder="Eigene Notizen zur Bewerbung …"
              rows={3}
            />
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
                  : "Bewerbung anlegen"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
