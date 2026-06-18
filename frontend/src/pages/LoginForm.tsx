import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Lock, Mail } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { useAuthStore } from "@/stores/auth.store";

const schema = z.object({
  email: z.email("Bitte gültige E-Mail eingeben."),
  password: z.string().min(1, "Passwort eingeben."),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setServerError("");
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Login fehlgeschlagen");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Logo />

        <nav className="auth-card__seg" aria-label="Anmelden oder Registrieren">
          <span className="auth-card__seg-btn auth-card__seg-btn--active">Anmelden</span>
          <Link to="/registration" className="auth-card__seg-btn">Registrieren</Link>
        </nav>

        <h1 className="auth-card__heading">Willkommen zurück</h1>
        <p className="auth-card__sub">
          Melde dich an und behalte all deine Bewerbungen an einem Ort.
        </p>

        <form className="formbody" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>

          <div className="widget">
            <div className="widget__label-row">
              <label>Passwort</label>
              <button type="button" className="btn btn--text">Vergessen?</button>
            </div>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                {...register("password")}
                className={`input--has-icon input--has-action${errors.password ? " error" : ""}`}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Verbergen" : "Zeigen"}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <label className="checkbox-row">
            <span
              className={`auth-card__checkbox${rememberMe ? " auth-card__checkbox--checked" : ""}`}
              aria-hidden="true"
            >
              {rememberMe && <Check size={12} strokeWidth={3} />}
            </span>{" "}
            <input
              type="checkbox"
              className="sr-only"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Angemeldet bleiben
          </label>

          {serverError && <span className="error-message">{serverError}</span>}

          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            {isSubmitting ? "Anmelden …" : "Anmelden"}
          </button>
        </form>

        <p className="auth-card__footer">
          Noch kein Konto?{" "}
          <Link to="/registration" className="btn btn--text">Jetzt registrieren</Link>
        </p>
      </div>
    </div>
  );
}
