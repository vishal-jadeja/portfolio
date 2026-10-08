export default function Personal() {
  return (
    <section id="personal" className="py-8 site-gutter bg-bg">
      <h2 className="section-title section-title-spaced">Personal</h2>
      <div className="personal-watchlist">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4" /></svg>
        <div>
          <h3 className="font-medium text-text-main text-sm">Movies &amp; series</h3>
          <p className="text-sm text-text-muted mt-1">Watchlist coming soon.</p>
        </div>
      </div>
    </section>
  );
}
