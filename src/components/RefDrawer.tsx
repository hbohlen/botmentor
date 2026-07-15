import { getRef } from '../lib/refs';

// Doc drawer: opens the cited reference so the student reads the robot's own
// documentation for the cause. The AI "tours" them to the source — Discernment
// as verification against an authority, not just accepting the answer. See ADR-011.
export function RefDrawer({
  refId,
  onClose,
}: {
  refId: string | null;
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
