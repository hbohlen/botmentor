import { getRef } from '../lib/refs';

// Why-this-ref provenance: which hypothesis cited the doc, and its ranking reason.
// Present when opened from a hypothesis chip; absent when browsed from the library.
export interface RefProvenance {
  rank: number;
  area: string;
  title: string;
  whyRanked: string;
}

// Doc drawer: opens the cited reference so the student reads the robot's own
// documentation for the cause. The AI "tours" them to the source — Discernment
// as verification against an authority, not just accepting the answer. When opened
// from a hypothesis, it also shows WHY it was cited, so the citation is checkable
// (Discernment made auditable). See ADR-011 / ADR-012.
export function RefDrawer({
  refId,
  provenance,
  onClose,
}: {
  refId: string | null;
  provenance?: RefProvenance | null;
  onClose: () => void;
}) {
  if (!refId) return null;
  const ref = getRef(refId);
  if (!ref) return null;
  return (
    <div className="drawer-backdrop" onClick={onClose} role="presentation">
      <aside
        className="drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label={`Reference: ${ref.title}`}
      >
        <header className="drawer-head">
          <span className="drawer-area">{ref.area}</span>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <h3 className="drawer-title">{ref.title}</h3>
        {provenance && (
          <div className="drawer-prov">
            <span className="drawer-prov-tag">Why you're seeing this</span>
            <p>
              Cited by hypothesis <strong>#{provenance.rank}</strong> ({provenance.area}):{' '}
              <em>{provenance.title}</em>. {provenance.whyRanked}
            </p>
          </div>
        )}
        <p className="drawer-summary">{ref.summary}</p>
        <div className="drawer-body">{ref.body}</div>
        {ref.snippet && <pre className="drawer-snippet">{ref.snippet}</pre>}
        <div className="drawer-tags">
          {ref.tags.map((t) => (
            <span key={t} className="rtag">
              {t}
            </span>
          ))}
        </div>
      </aside>
    </div>
  );
}
