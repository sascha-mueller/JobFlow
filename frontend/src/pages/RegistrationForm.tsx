import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Lock, Mail } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { useAuthStore } from "@/stores/auth.store";

const schema = z.object({
  firstName: z.string().min(1, "Pflichtfeld"),
  lastName: z.string().min(1, "Pflichtfeld"),
  email: z.email("Gültige E-Mail eingeben."),
  password: z.string().min(8, "Mindestens 8 Zeichen."),
});

type FormData = z.infer<typeof schema>;

function pwScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const PW_LABELS = ["Zu kurz", "Schwach", "Okay", "Gut", "Stark"];

function barModifier(index: number, score: number) {
  if (index >= score) return "";
  if (score <= 1) return " pw-bar--weak";
  if (score === 2) return " pw-bar--ok";
  return " pw-bar--strong";
}

export default function RegistrationForm() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.register);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch("password", "");
  const score = pwScore(password);

  const onSubmit = async (data: FormData) => {
    if (!agreeTerms) {
      setTermsError("Bitte zustimmen.");
      return;
    }
    setTermsError("");
    try {
      setServerError("");
      await registerUser(data.email, data.password, data.firstName, data.lastName);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registrierung fehlgeschlagen");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Logo />

        <nav className="auth-card__seg" aria-label="Anmelden oder Registrieren">
          <Link to="/login" className="auth-card__seg-btn">Anmelden</Link>
          <span className="auth-card__seg-btn auth-card__seg-btn--active">Registrieren</span>
        </nav>

        <h1 className="auth-card__heading">Konto erstellen</h1>
        <p className="auth-card__sub">
          In einer Minute eingerichtet — und alle Bewerbungen im Blick.
        </p>

        <form className="formbody" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="auth-card__names">
            <div className="widget">
              <label>Vorname</label>
              <input
                {...register("firstName")}
                className={errors.firstName ? "error" : ""}
                placeholder="Lena"
                autoComplete="given-name"
              />
              {errors.firstName && (
                <span className="error-message">{errors.firstName.message}</span>
              )}
            </div>

            <div className="widget">
              <label>Nachname</label>
              <input
                {...register("lastName")}
                className={errors.lastName ? "error" : ""}
                placeholder="Hofmann"
                autoComplete="family-name"
              />
              {errors.lastName && (
                <span className="error-message">{errors.lastName.message}</span>
              )}
            </div>
          </div>

          <div className="widget">
            <label>E-Mail</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                {...register("email")}
                className={`input--has-icon${errors.email ? " error" : ""}`}
                type="email"
                placeholder="du@email.de"
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="widget">
            <label>Passwort</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                {...register("password")}
                className={`input--has-icon input--has-action${errors.password ? " error" : ""}`}
                type={showPassword ? "text" : "password"}
                placeholder="Mindestens 8 Zeichen"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Verbergen" : "Zeigen"}
              </button>
            </div>
            {password && (
              <div className="pw-strength">
                <div className="pw-bars">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`pw-bar${barModifier(i, score)}`} />
                  ))}
                </div>
                <span className="pw-label">{PW_LABELS[score]}</span>
              </div>
            )}
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <label className="checkbox-row">
            <span
              className={`auth-card__checkbox${agreeTerms ? " auth-card__checkbox--checked" : ""}`}
              aria-hidden="true"
            >
              {agreeTerms && <Check size={12} strokeWidth={3} />}
            </span>{" "}
            <input
              type="checkbox"
              className="sr-only"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (e.target.checked) setTermsError("");
              }}
            />
            <span>Ich akzeptiere die <Link to="/agb" className="btn btn-text">AGB</Link> und die <Link to="/datenschutz" className="btn btn-text">Datenschutzerklärung</Link>.</span>
          </label>
          {termsError && <span className="error-message">{termsError}</span>}
          {serverError && <span className="error-message">{serverError}</span>}

          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
            {isSubmitting ? "Konto wird erstellt …" : "Konto erstellen"}
          </button>
        </form>

        <p className="auth-card__footer">
          Schon registriert?{" "}
          <Link to="/login" className="btn btn-text">Zur Anmeldung</Link>
        </p>
      </div>
    </div>
  );
}
