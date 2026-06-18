import { Link } from "react-router";
import Logo from "@/components/ui/Logo";

export default function PageNotFound() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Logo />
        <h1 className="auth-card__heading" style={{ marginTop: "1.75rem" }}>
          404 – Seite nicht gefunden
        </h1>
        <p className="auth-card__sub">
          Die gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link to="/dashboard" className="btn btn--primary" style={{ display: "block", marginTop: "1.5rem", textAlign: "center", textDecoration: "none" }}>
          Zur Übersicht
        </Link>
      </div>
    </div>
  );
}
