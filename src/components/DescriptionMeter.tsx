import { useMemo } from 'react';

// Live coaching for the 4D "Description" competency. As the student types, show a
// quality gauge + concrete tips — turning the static intake form into real-time
// Description coaching (the Skilljar "description<->discernment loop"). UI-only;
// no backend, no DiagnoseResult change.
const SYMPTOM_WORDS = [
  'won', 'stutter', 'dead', 'turn', 'move', 'light', 'motor', 'wheel', 'battery',
  'wire', 'sensor', 'drop', 'spin', 'stop', 'flicker', 'veer', 'drift', 'claw', 'arm',
  'remote', 'controller', 'code', 'program', 'beep', 'heat',
];

export function DescriptionMeter({
  symptom,
  changed,
  expected,
}: {
  symptom: string;
  changed: string;
  expected: string;
}) {
  const { score, label, tips } = useMemo(() => {
    let s = 0;
    const sym = symptom.trim().toLowerCase();
    if (sym.length >= 12) s += 25;
    else if (sym.length >= 4) s += 10;
    const hasWord = SYMPTOM_WORDS.some((w) => sym.includes(w));
    if (hasWord) s += 25;
    if (changed.trim()) s += 25;
    if (expected.trim()) s += 25;

    let label = 'Too thin';
    if (s >= 75) label = 'Clear enough';
    else if (s >= 40) label = 'Getting there';

    const tips: string[] = [];
    if (!hasWord && sym.length < 12) tips.push('Name the part or behavior (motor, turns, dies…)');
    if (!changed.trim()) tips.push('Add what changed since it last worked.');
    if (!expected.trim()) tips.push('Add what you expected to happen.');
    return { score: s, label, tips };
  }, [symptom, changed, expected]);

  const color = score >= 75 ? '#22c55e' : score >= 40 ? '#eab308' : '#f87171';

  return (
    <div className="desc-meter" role="status" aria-live="polite">
      <div className="desc-meter-head">
        <span>Description quality</span>
        <span className="desc-label" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="desc-bar">
        <div className="desc-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      {tips.length > 0 && (
        <ul className="desc-tips">
          {tips.map((t) => (
            <li key={t}>💡 {t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
