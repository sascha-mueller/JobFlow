import { useUiStore } from "@/stores/ui.store";

const Header = () => {
  const { title, subtitle, metaTitle, metaDescription } = useUiStore(
    (s) => s.pageMeta
  );

  return (
    <>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <header className="header">
        <div className="header__titles">
          <h1 className="header__title">{title}</h1>
          {subtitle && <p className="header__subtitle">{subtitle}</p>}
        </div>
      </header>
    </>
  );
};

export default Header;
