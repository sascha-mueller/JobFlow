import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Globe, Pencil, Plus, X } from "lucide-react";
import type { Language, Profile, ProfileLink, UpdateProfileInput } from "@jobflow/shared";
import { profileApi } from "@/lib/profile.api";
import { applicationsApi } from "@/lib/applications.api";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";

type FormState = Required<Pick<UpdateProfileInput,
  "firstName" | "lastName" | "headline" | "summary" |
  "email" | "phone" | "city" | "country" |
  "desiredSalary" | "availability" | "workModel" |
  "skills" | "languages" | "links"
>> & { yearsExperience?: number };

function toFormState(p: Profile, fallbackEmail = ""): FormState {
  return {
    firstName: p.firstName ?? "",
    lastName: p.lastName ?? "",
    headline: p.headline ?? "",
    summary: p.summary ?? "",
    email: p.email ?? fallbackEmail,
    phone: p.phone ?? "",
    city: p.city ?? "",
    country: p.country ?? "",
    yearsExperience: p.yearsExperience,
    desiredSalary: p.desiredSalary ?? "",
    availability: p.availability ?? "",
    workModel: p.workModel ?? "",
    skills: p.skills ?? [],
    languages: p.languages ?? [],
    links: p.links ?? [],
  };
}

function initials(first: string, last: string): string {
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase();
}

export default function ProfilePage() {
  const setPageMeta = useUiStore((s) => s.setPageMeta);
  const authEmail = useAuthStore((s) => s.user?.email ?? "");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<FormState>(toFormState({} as Profile));
  const [savedForm, setSavedForm] = useState<FormState>(toFormState({} as Profile));
  const [appCount, setAppCount] = useState(0);
  const [loadState, setLoadState] = useState<"loading" | "error" | "done">("loading");
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    Promise.all([profileApi.getMe(), applicationsApi.getAll()])
      .then(([p, apps]) => {
        setProfile(p);
        const fv = toFormState(p, authEmail);
        setForm(fv);
        setSavedForm(fv);
        setAppCount(apps.length);
        setLoadState("done");
      })
      .catch(() => setLoadState("error"));
  }, []);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      // Strip empty strings — unset optional fields must not be sent at all,
      // otherwise Zod rejects them (e.g. min(2) on firstName/lastName).
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, v]) => {
          if (Array.isArray(v)) return true;
          if (typeof v === "string") return v !== "";
          return v !== undefined;
        }),
      ) as UpdateProfileInput;
      const updated = await profileApi.update(payload);
      setProfile(updated);
      const fv = toFormState(updated);
      setForm(fv);
      setSavedForm(fv);
      toast.success("Änderungen gespeichert.");
    } catch {
      toast.error("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }, [form]);

  const handleReset = useCallback(() => {
    setForm(savedForm);
  }, [savedForm]);

  // Use refs so the pageMeta callbacks always call the latest version.
  const handleSaveRef = useRef(handleSave);
  const handleResetRef = useRef(handleReset);
  useEffect(() => { handleSaveRef.current = handleSave; }, [handleSave]);
  useEffect(() => { handleResetRef.current = handleReset; }, [handleReset]);

  useEffect(() => {
    setPageMeta({
      title: "Meine Daten",
      subtitle: "Dein Profil wird für Bewerbungen verwendet.",
      metaTitle: "Meine Daten | JobVault",
      metaDescription: "Dein persönliches Profil für Bewerbungen.",
      ...(isDirty && !saving
        ? {
            action: { label: "Änderungen speichern", onClick: () => handleSaveRef.current() },
            secondaryAction: { label: "Zurücksetzen", onClick: () => handleResetRef.current() },
          }
        : { action: undefined, secondaryAction: undefined }),
    });
  }, [isDirty, saving, setPageMeta]);

  const setField = <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill || form.skills.includes(skill)) return;
    setForm((f) => ({ ...f, skills: [...f.skills, skill] }));
    setNewSkill("");
  };

  const removeSkill = (skill: string) =>
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));

  const addLanguage = (lang: Language) =>
    setForm((f) => ({ ...f, languages: [...f.languages, lang] }));

  const removeLanguage = (i: number) =>
    setForm((f) => ({ ...f, languages: f.languages.filter((_, j) => j !== i) }));

  const addLink = (link: ProfileLink) =>
    setForm((f) => ({ ...f, links: [...f.links, link] }));

  const removeLink = (i: number) =>
    setForm((f) => ({ ...f, links: f.links.filter((_, j) => j !== i) }));

  if (loadState === "loading") return <p className="profile-feedback">Lade …</p>;
  if (loadState === "error" || !profile) {
    return <p className="profile-feedback profile-feedback--error">Profil konnte nicht geladen werden.</p>;
  }

  return (
    <form className="profile-page" onSubmit={(e) => e.preventDefault()}>
      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-hero__avatar-wrap">
          <span className="profile-hero__avatar">
            {initials(form.firstName, form.lastName)}
          </span>
          <button className="profile-hero__avatar-edit" type="button" aria-label="Foto ändern">
            <Pencil size={11} />
          </button>
        </div>

        <div className="profile-hero__info">
          <span className="profile-hero__label">Profil</span>
          <h2 className="profile-hero__name">{form.firstName} {form.lastName}</h2>
          <p className="profile-hero__headline">{form.headline || <span className="profile-hero__headline--empty">Noch keine Headline</span>}</p>
        </div>

        <div className="profile-hero__stats">
          <div className="profile-stat">
            <span className="profile-stat__value">{form.yearsExperience ?? "—"}</span>
            <span className="profile-stat__label">Jahre Erf.</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__value">{appCount}</span>
            <span className="profile-stat__label">Bewerbungen</span>
          </div>
        </div>
      </div>

      {/* 2-column grid */}
      <div className="profile-grid">
        {/* Main column */}
        <div className="profile-col-main">

          {/* Persönliche Daten */}
          <section className="profile-panel">
            <h3 className="profile-panel__title">Persönliche Daten</h3>
            <div className="profile-fields">
              <div className="profile-row-2">
                <ProfileField label="Vorname">
                  <input value={form.firstName} onChange={setField("firstName")} />
                </ProfileField>
                <ProfileField label="Nachname">
                  <input value={form.lastName} onChange={setField("lastName")} />
                </ProfileField>
              </div>
              <ProfileField label="Jobtitel / Headline">
                <input
                  value={form.headline}
                  onChange={setField("headline")}
                  placeholder="z. B. Produktdesignerin · UX & Research"
                />
              </ProfileField>
              <div className="profile-row-2">
                <ProfileField label="E-Mail">
                  <input type="email" value={form.email} onChange={setField("email")} />
                </ProfileField>
                <ProfileField label="Telefon">
                  <input type="tel" value={form.phone} onChange={setField("phone")} />
                </ProfileField>
              </div>
              <div className="profile-row-2">
                <ProfileField label="Stadt">
                  <input value={form.city} onChange={setField("city")} />
                </ProfileField>
                <ProfileField label="Land">
                  <input value={form.country} onChange={setField("country")} />
                </ProfileField>
              </div>
            </div>
          </section>

          {/* Über mich */}
          <section className="profile-panel">
            <h3 className="profile-panel__title">Über mich</h3>
            <ProfileField label="Kurzprofil">
              <textarea
                className="profile-summary"
                rows={5}
                value={form.summary}
                onChange={setField("summary")}
                placeholder="Beschreibe dich in 2–3 Sätzen …"
              />
              <span className="profile-char-count">{form.summary.length} Zeichen</span>
            </ProfileField>
          </section>

          {/* Fähigkeiten */}
          <section className="profile-panel">
            <h3 className="profile-panel__title">Fähigkeiten</h3>
            {form.skills.length > 0 && (
              <div className="profile-skills">
                {form.skills.map((skill) => (
                  <span key={skill} className="profile-skill-tag">
                    {skill}
                    <button
                      type="button"
                      className="profile-skill-tag__remove"
                      onClick={() => removeSkill(skill)}
                      aria-label={`${skill} entfernen`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="profile-skill-add">
              <input
                className="profile-skill-input"
                placeholder="Fähigkeit hinzufügen …"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addSkill(); }
                }}
              />
              <button
                type="button"
                className="profile-skill-add-btn"
                onClick={addSkill}
                aria-label="Fähigkeit hinzufügen"
              >
                <Plus size={16} />
              </button>
            </div>
          </section>
        </div>

        {/* Side column */}
        <div className="profile-col-side">

          {/* Präferenzen */}
          <section className="profile-panel">
            <h3 className="profile-panel__title">Präferenzen</h3>
            <div className="profile-fields">
              <ProfileField label="Gewünschtes Gehalt">
                <input
                  value={form.desiredSalary}
                  onChange={setField("desiredSalary")}
                  placeholder="z. B. 60.000 €"
                />
              </ProfileField>
              <ProfileField label="Verfügbarkeit">
                <input
                  value={form.availability}
                  onChange={setField("availability")}
                  placeholder="z. B. Ab sofort"
                />
              </ProfileField>
              <ProfileField label="Arbeitsmodell">
                <input
                  value={form.workModel}
                  onChange={setField("workModel")}
                  placeholder="z. B. Hybrid / Remote"
                />
              </ProfileField>
              <ProfileField label="Jahre Berufserfahrung">
                <input
                  type="number"
                  min={0}
                  value={form.yearsExperience ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      yearsExperience: e.target.value === "" ? undefined : Number(e.target.value),
                    }))
                  }
                  placeholder="z. B. 4"
                />
              </ProfileField>
            </div>
          </section>

          {/* Sprachen */}
          <section className="profile-panel">
            <h3 className="profile-panel__title">Sprachen</h3>
            <div className="profile-languages">
              {form.languages.length === 0 && (
                <p className="profile-empty">Noch keine Sprachen hinzugefügt.</p>
              )}
              {form.languages.map((lang, i) => (
                <div key={i} className="profile-language-row">
                  <span className="profile-language-name">{lang.name}</span>
                  <span className="profile-language-level">{lang.level}</span>
                  <button
                    type="button"
                    className="profile-row-remove"
                    onClick={() => removeLanguage(i)}
                    aria-label={`${lang.name} entfernen`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <LanguageAddRow onAdd={addLanguage} />
            </div>
          </section>

          {/* Links */}
          <section className="profile-panel">
            <h3 className="profile-panel__title">Links</h3>
            <div className="profile-links-list">
              {form.links.length === 0 && (
                <p className="profile-empty">Noch keine Links hinzugefügt.</p>
              )}
              {form.links.map((link, i) => (
                <div key={i} className="profile-link-row">
                  <Globe size={13} className="profile-link-icon" aria-hidden="true" />
                  <span className="profile-link-label">{link.label}</span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link-url"
                  >
                    {link.url.replace(/^https?:\/\//, "")}
                  </a>
                  <button
                    type="button"
                    className="profile-row-remove"
                    onClick={() => removeLink(i)}
                    aria-label={`${link.label} entfernen`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <LinkAddRow onAdd={addLink} />
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function ProfileField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="profile-field">
      <label className="profile-field__label">{label}</label>
      {children}
    </div>
  );
}

function LanguageAddRow({ onAdd }: { onAdd: (lang: Language) => void }) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");

  const add = () => {
    if (!name.trim() || !level.trim()) return;
    onAdd({ name: name.trim(), level: level.trim() });
    setName("");
    setLevel("");
  };

  return (
    <div className="profile-add-row">
      <input
        className="profile-add-row__input"
        placeholder="Sprache"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
      />
      <input
        className="profile-add-row__input"
        placeholder="Niveau (z. B. C1)"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
      />
      <button
        type="button"
        className="profile-add-row__btn"
        onClick={add}
        aria-label="Sprache hinzufügen"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function LinkAddRow({ onAdd }: { onAdd: (link: ProfileLink) => void }) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const add = () => {
    if (!label.trim() || !url.trim()) return;
    onAdd({ label: label.trim(), url: url.trim() });
    setLabel("");
    setUrl("");
  };

  return (
    <div className="profile-add-row">
      <input
        className="profile-add-row__input"
        placeholder="Bezeichnung (z. B. Portfolio)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
      />
      <input
        className="profile-add-row__input"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
      />
      <button
        type="button"
        className="profile-add-row__btn"
        onClick={add}
        aria-label="Link hinzufügen"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
