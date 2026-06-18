import { Link } from "react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { useUiStore } from "@/stores/ui.store";

const Header = () => {
  const { title, subtitle, metaTitle, metaDescription, action, backLink } =
    useUiStore((s) => s.pageMeta);

  return (
    <>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <header className="header">
        {backLink ? (
          <div className="header__breadcrumb">
            <Link to={backLink.href} className="header__back-btn">
              <ArrowLeft size={15} />
              {backLink.label}
            </Link>
            <span className="header__breadcrumb-sep" aria-hidden="true">
              /
            </span>
            <span className="header__breadcrumb-current">{title}</span>
          </div>
        ) : (
          <div className="header__titles">
            <h1 className="header__title">
              {subtitle && (
                <span className="header__subtitle">{subtitle}</span>
              )}{" "}
              {title}
            </h1>
          </div>
        )}
        {action && (
          <button
            type="button"
            className="btn btn-primary header__action"
            onClick={action.onClick}
          >
            <Plus size={16} aria-hidden="true" />
            {action.label}
          </button>
        )}
      </header>
    </>
  );
};

export default Header;
