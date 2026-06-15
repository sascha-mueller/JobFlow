import { Building2, ListChecks, LogOut, UserRound } from "lucide-react";
import { NavLink } from "react-router";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", Icon: ListChecks },
  { to: "/firmen", label: "Firmen", Icon: Building2 },
  { to: "/profil", label: "Meine Daten", Icon: UserRound },
];

const NavSidebar = () => {
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
      <button className="nav-sidebar__logout" type="button">
        <LogOut size={18} aria-hidden="true" />
        Abmelden
      </button>
    </nav>
  );
};

export default NavSidebar;
