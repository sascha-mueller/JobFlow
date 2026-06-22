import { Link } from "react-router";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { useUiStore } from "@/stores/ui.store";

const Header = () => {
  const { title, subtitle, metaTitle, metaDescription, action, secondaryAction, backLink } =
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
        {(secondaryAction || action) && (
          <div className="header__actions">
            {secondaryAction && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </button>
            )}
            {action && (
              <button
                type="button"
                className="btn btn-primary header__action"
                onClick={action.onClick}
              >
                {secondaryAction ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                {action.label}
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
