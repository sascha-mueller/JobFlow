import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Printer, ArrowLeft } from "lucide-react";
import type { Application, Profile } from "@jobflow/shared";
import { applicationsApi } from "@/lib/applications.api";
import { profileApi } from "@/lib/profile.api";

const SUBMITTED_STATUSES = new Set(["SENT", "INTERVIEW", "OFFER", "ACCEPTED", "REJECTED"]);

export default function PrintApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "error" | "done">("loading");

  useEffect(() => {
    Promise.all([applicationsApi.getAll(), profileApi.getMe()])
      .then(([apps, prof]) => {
        const submitted = apps
          .filter((a) => SUBMITTED_STATUSES.has(a.status))
          .sort((a, b) => {
            if (!a.appliedAt && !b.appliedAt) return 0;
            if (!a.appliedAt) return 1;
            if (!b.appliedAt) return -1;
            return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
          });
        setApplications(submitted);
        setProfile(prof);
        setLoadState("done");
      })
      .catch(() => setLoadState("error"));
  }, []);

  return (
    <div className="print-page">
      <div className="print-page__toolbar no-print">
        <button className="print-toolbar__back" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={15} />
          Zurück
        </button>
        <button className="print-toolbar__print btn btn-primary" onClick={() => window.print()}>
          <Printer size={15} />
          Drucken
        </button>
      </div>

      <header className="print-header">
        <h1 className="print-header__title">Bewerbungsübersicht</h1>
        <p className="print-header__meta">
          {profile && (
            <>von {profile.firstName} {profile.lastName}, </>
          )}
          erstellt am{" "}
          {new Date().toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      {loadState === "loading" && <p className="print-feedback">Lade Bewerbungen …</p>}
      {loadState === "error" && (
        <p className="print-feedback print-feedback--error">
          Bewerbungen konnten nicht geladen werden.
        </p>
      )}

      {loadState === "done" && applications.length === 0 && (
        <p className="print-feedback">Keine abgesendeten Bewerbungen vorhanden.</p>
      )}

      {loadState === "done" && applications.length > 0 && (
        <table className="print-table">
          <thead>
            <tr>
              <th className="print-table__th print-table__th--position">Position / Firma</th>
              <th className="print-table__th print-table__th--applied">Beworben am</th>
              <th className="print-table__th print-table__th--followup">Rückmeldung</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id} className="print-table__row">
                <td className="print-table__td">
                  <span className="print-position">{app.name}</span>
                  {app.company?.name && (
                    <span className="print-company">{app.company.name}</span>
                  )}
                </td>

                <td className="print-table__td print-table__td--date">
                  {app.appliedAt ? formatDate(app.appliedAt) : <span className="print-empty">–</span>}
                </td>

                <td className="print-table__td print-table__td--date">
                  {resolveResponse(app)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {loadState === "done" && applications.length > 0 && (
        <p className="print-footer">
          {applications.length}{" "}
          {applications.length === 1 ? "Bewerbung" : "Bewerbungen"} gesamt
        </p>
      )}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function resolveResponse(app: Application): React.ReactNode {
  const isInvited = app.status === "INTERVIEW" || app.status === "OFFER" || app.status === "ACCEPTED";
  const isRejected = app.status === "REJECTED";

  if (!isInvited && !isRejected) {
    return <span className="print-response" data-type="open">Offen</span>;
  }

  const label = isRejected ? "Abgesagt am" : "Eingeladen am";
  const date = app.followUpAt ? formatDate(app.followUpAt) : "–";

  return (
    <span className="print-response" data-type={isRejected ? "rejected" : "invited"}>
      {label} {date}
    </span>
  );
}
