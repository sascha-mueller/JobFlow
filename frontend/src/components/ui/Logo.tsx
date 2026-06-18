export default function Logo() {
  return (
    <div className="logo__link">
      <span className="logo__img">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 7h6M5 12h10M5 17h7M16 5l3 3-3 3"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      Job<span className="logo__txt-highlight">Flow</span>
    </div>
  );
}
