import { useMemo } from 'react';
import { getFeedback, type FeedbackEntry } from '../lib/storage';

interface AreaStat {
  area: string;
  yes: number;
  no: number;
  partial: number;
}

// Diligence made legible: the "Did this work?" marks the student has logged, visualized.
// Pure client read of localStorage — no backend, no DiagnoseResult change. See ADR-010.
export function FixesLog() {
  const feedback = useMemo<FeedbackEntry[]>(() => getFeedback(), []);

  const stats = useMemo<AreaStat[]>(() => {
    const map = new Map<string, AreaStat>();
    for (const f of feedback) {
      const s = map.get(f.area) ?? { area: f.area, yes: 0, no: 0, partial: 0 };
      s[f.worked]++;
      map.set(f.area, s);
    }
    return [...map.values()].sort((a, b) => b.yes + b.no + b.partial - (a.yes + a.no + a.partial));
  }, [feedback]);

  if (feedback.length === 0) {
    return (
      <details className="fixes">
        <summary>Your fixes (0 logged)</summary>
        <p className="fixes-empty">
          When you mark “Did this work?” on a mentor idea, your history shows up here — the
          Diligence loop, made visible.
        </p>
      </details>
    );
  }

  const worked = feedback.filter((f) => f.worked === 'yes').length;
  const pct = Math.round((worked / feedback.length) * 100);

  return (
    <details className="fixes" open>
      <summary>
        Your fixes ({feedback.length} logged · {pct}% worked)
      </summary>
      <ul className="fixes-list">
        {stats.map((s) => {
          const total = s.yes + s.no + s.partial;
          const wPct = Math.round((s.yes / total) * 100);
          return (
            <li key={s.area}>
              <span className="fixes-area">{s.area}</span>
              <span className="fixes-bar" title={`${s.yes} worked · ${s.no} didn’t · ${s.partial} partial`}>
                <span className="fixes-fill" style={{ width: `${wPct}%` }} />
              </span>
              <span className="fixes-count">{s.yes}/{total}</span>
            </li>
          );
        })}
      </ul>
      <p className="fixes-note">
        🔁 Logged for this browser only. Each mark is one more turn of the iterate-verify loop.
      </p>
    </details>
  );
}
