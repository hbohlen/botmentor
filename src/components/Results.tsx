import { useEffect, useState } from 'react';
import type { DiagnoseResult } from '../types';
import { DTagChips } from './DTagChips';
import { HypothesisCard } from './HypothesisCard';
import { DelegationPanel } from './DelegationPanel';
import { FixesLog } from './FixesLog';
import { RefDrawer } from './RefDrawer';
import { getChecklist, setChecklist } from '../lib/storage';

export function Results({ result }: { result: DiagnoseResult }) {
  const [checklists, setChecklists] = useState<Record<string, boolean[]>>(() => {
    const init: Record<string, boolean[]> = {};
    result.hypotheses.forEach((h, i) => {
      const id = `${h.area}-${i + 1}`;
      const saved = getChecklist(id);
      init[id] =
        saved && saved.length === h.plainSteps.length ? saved : h.plainSteps.map(() => false);
    });
    return init;
  });
  const [openRef, setOpenRef] = useState<string | null>(null);

  // Persist every checklist change (single source of truth for storage).
  useEffect(() => {
    Object.entries(checklists).forEach(([id, arr]) => setChecklist(id, arr));
  }, [checklists]);

  const total = result.hypotheses.reduce((n, h) => n + h.plainSteps.length, 0);
  const done = Object.values(checklists).reduce(
    (n, arr) => n + arr.filter(Boolean).length,
    0
  );

  function onChecklist(id: string, next: boolean[]) {
    setChecklists((prev) => ({ ...prev, [id]: next }));
  }

  return (
    <section className="results">
      <DelegationPanel total={total} done={done} />
      <div className="results-head">
        <h2>Mentor ideas</h2>
        <DTagChips tags={result.dTags} />
      </div>
      {result.note && <p className="note">💡 {result.note}</p>}
      {result.hypotheses.length === 0 && (
        <p className="empty">
          No confident hypotheses — try adding what changed and what you expected.
        </p>
      )}
      <ol className="hyp-list">
        {result.hypotheses.map((h, i) => {
          const id = `${h.area}-${i + 1}`;
          return (
            <HypothesisCard
              key={i}
              hypothesis={h}
              rank={i + 1}
              checklist={checklists[id]}
              onChecklist={(next) => onChecklist(id, next)}
              onOpenRef={setOpenRef}
            />
          );
        })}
      </ol>
      <FixesLog />
      <RefDrawer refId={openRef} onClose={() => setOpenRef(null)} />
    </section>
  );
}
