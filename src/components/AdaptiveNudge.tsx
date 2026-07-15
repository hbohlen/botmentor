import { useMemo } from 'react';
import { getFeedback } from '../lib/storage';

// Diligence nudge at intake: surface a client-side trend from the student's logged marks
// so they re-engage the iterate-verify loop before the next diagnosis. No backend; reads
// localStorage only. See ADR-010.
export function AdaptiveNudge() {
  const tip = useMemo(() => {
    const f = getFeedback();
    if (f.length === 0) return null;
    const worked = f.filter((x) => x.worked === 'yes').length;
    const pct = Math.round((worked / f.length) * 100);

    // Lowest-success area → worth a second look with a mentor.
    const byArea = new Map<string, { yes: number; total: number }>();
    for (const x of f) {
      const a = byArea.get(x.area) ?? { yes: 0, total: 0 };
      a.total++;
      if (x.worked === 'yes') a.yes++;
      byArea.set(x.area, a);
    }
    let weak: { area: string; pct: number } | null = null;
    for (const [area, s] of byArea) {
      const p = Math.round((s.yes / s.total) * 100);
      if (p < 100 && (!weak || p < weak.pct)) weak = { area, pct: p };
    }

    if (weak) {
      return `Last time, your ${weak.area} fixes only worked ${weak.pct}% — worth a second look with a mentor before swapping parts.`;
    }
    return `You've logged ${f.length} fixes and ${pct}% worked. Keep verifying before you swap parts.`;
  }, []);

  if (!tip) return null;
  return (
    <div className="nudge" role="status">
      🔁 {tip}
    </div>
  );
}
