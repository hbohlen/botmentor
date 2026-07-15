import type { Hypothesis } from '../types';
import { getChecklist, setChecklist } from '../lib/storage';

interface Props {
  hypothesisId: string;
  steps: string[];
  verifyFirst: boolean;
  checklist: boolean[];
  onChange: (next: boolean[]) => void;
}

// The student's half of the 4D Delegation split: the physical tests they run with
// their own hands. Claude never does these — the mentoring happens here. Tappable
// + persisted (via the parent's effect) so progress survives reload. See ADR-007.
export function ActionChecklist({ hypothesisId, steps, verifyFirst, checklist, onChange }: Props) {
  const done = checklist.filter(Boolean).length;

  function toggle(i: number) {
    const next = [...checklist];
    next[i] = !next[i];
    setChecklist(hypothesisId, next);
    onChange(next);
  }

  return (
    <div className="checklist">
      <div className="checklist-head">
        <span className="hands">✋ You do this</span>
        <span className="check-count">{done}/{steps.length}</span>
      </div>
      {verifyFirst && (
        <p className="verify">⚠ Verify this first — a cheap/safe check before swapping parts.</p>
      )}
      <ol className="steps">
        {steps.map((s, i) => (
          <li key={i} className={checklist[i] ? 'done' : ''}>
            <label>
              <input type="checkbox" checked={checklist[i]} onChange={() => toggle(i)} />
              <span>{s}</span>
            </label>
          </li>
        ))}
      </ol>
    </div>
  );
}
