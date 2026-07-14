import type { DTag } from '../types';

const COLORS: Record<DTag, string> = {
  Delegation: '#2563eb',
  Description: '#7c3aed',
  Discernment: '#d97706',
  Diligence: '#059669',
};

// Visible teaching overlay (Q3 resolved: visible). Each response shows which 4D skills it
// exercised, so students learn the framework, not just get an answer.
export function DTagChips({ tags }: { tags: DTag[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="dtags">
      {tags.map((t) => (
        <span key={t} className="dtag" style={{ background: COLORS[t] }}>
          {t}
        </span>
      ))}
    </div>
  );
}
