import { Link } from "react-router";
import NavSidebar from "./NavSidebar";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo">
        <Link className="logo__link" to="/dashboard">
          <svg
            className="logo__img"
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
          >
            <g transform="translate(5 5) scale(0.75)">
              <path
                d="M5 7h6M5 12h10M5 17h7M16 5l3 3-3 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.667"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </g>
          </svg>
          Job
          <span className="logo__txt-highlight">Flow</span>
        </Link>
      </div>

      <NavSidebar />
    </aside>
  );
};

export default Sidebar;
