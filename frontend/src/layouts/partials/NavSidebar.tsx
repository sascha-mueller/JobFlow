import { Briefcase, Building2, Contact, ListChecks, LogOut, UserRound } from "lucide-react";
import { NavLink } from "react-router";
import { useAuthStore } from "@/stores/auth.store";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", Icon: ListChecks },
  { to: "/bewerbungen", label: "Bewerbungen", Icon: Briefcase },
  { to: "/firmen", label: "Firmen", Icon: Building2 },
  { to: "/kontakte", label: "Kontakte", Icon: Contact },
  { to: "/profil", label: "Meine Daten", Icon: UserRound },
];

function getInitials(firstName?: string, lastName?: string): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  return "??";
}

const NavSidebar = () => {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const initials = getInitials(user?.firstName, user?.lastName);
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email ?? "";

  return (
    <nav className="nav-sidebar">
      <span className="nav-sidebar__title">Menü</span>
      <ul className="nav-sidebar__list">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink className="nav-sidebar__link" to={to}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="nav-sidebar__user-card">
        <span className="nav-sidebar__avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="nav-sidebar__user-info">
          <span className="nav-sidebar__user-name">{displayName}</span>
          {user?.firstName && (
            <span className="nav-sidebar__user-email">{user.email}</span>
          )}
        </span>
        <span className="nav-sidebar__user-email-mobile" aria-hidden="true">
          {user?.email}
        </span>
        <button
          className="nav-sidebar__logout"
          type="button"
          onClick={logout}
        >
          <LogOut size={18} aria-hidden="true" />
          <span className="nav-sidebar__logout-label">Abmelden</span>
        </button>
      </div>
    </nav>
  );
};

export default NavSidebar;
