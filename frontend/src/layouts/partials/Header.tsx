import { useUiStore } from "@/stores/ui.store";

const Header = () => {
  const { title, subtitle, metaTitle, metaDescription } = useUiStore(
    (s) => s.pageMeta,
  );

  return (
    <>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <header className="header">
        <div className="header__titles">
          <h1 className="header__title">
            {subtitle && <span className="header__subtitle">{subtitle}</span>}{" "}
            {title}
          </h1>
        </div>
      </header>
    </>
  );
};

export default Header;
