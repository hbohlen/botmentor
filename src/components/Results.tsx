import { useEffect, useRef, useState } from 'react';
import type { DiagnoseResult } from '../types';
import { DTagChips } from './DTagChips';
import { HypothesisCard } from './HypothesisCard';
import { DelegationPanel } from './DelegationPanel';
import { FixesLog } from './FixesLog';
import { RefDrawer, type RefProvenance } from './RefDrawer';
import { HandoffCard } from './HandoffCard';
import { SafetyBanner } from './SafetyBanner';
import { NextSafeTest } from './NextSafeTest';
import { getChecklist, getTestRecords, scopedChecklistId, setChecklist } from '../lib/storage';

export function Results({ result, intake }: { result: DiagnoseResult; intake: string }) {
  const [investigationId] = useState(() => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
  const [checklists, setChecklists] = useState<Record<string, boolean[]>>(() => {
    const init: Record<string, boolean[]> = {};
    result.hypotheses.forEach((hypothesis, index) => {
      const id = `${hypothesis.area}-${index + 1}`;
      const saved = getChecklist(scopedChecklistId(investigationId, id));
      init[id] = saved && saved.length === hypothesis.plainSteps.length ? saved : hypothesis.plainSteps.map(() => false);
    });
    return init;
  });
  const [openRef, setOpenRef] = useState<string | null>(null);
  const [openProv, setOpenProv] = useState<RefProvenance | null>(null);
  const [testRecords, setTestRecords] = useState(() => getTestRecords(investigationId));
  const pitReportRef = useRef<HTMLDivElement>(null);

  function openRefWith(id: string, provenance: RefProvenance) {
    setOpenRef(id);
    setOpenProv(provenance);
  }

  useEffect(() => {
    Object.entries(checklists).forEach(([id, checklist]) => setChecklist(scopedChecklistId(investigationId, id), checklist));
  }, [checklists, investigationId]);

  const total = result.hypotheses.reduce((count, hypothesis) => count + hypothesis.plainSteps.length, 0);
  const done = Object.values(checklists).reduce((count, checklist) => count + checklist.filter(Boolean).length, 0);

  function showPitReport() {
    pitReportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const details = pitReportRef.current?.querySelector('details');
    if (details) details.open = true;
  }

  return (
    <section className="results" aria-label="Your troubleshooting path">
      <SafetyBanner />
      {result.note && <p className="note">{result.note}</p>}
      {result.hypotheses.length === 0 ? (
        <section className="next-test mentor-stop">
          <h2>Let’s ask a mentor</h2>
          <p>BotMentor does not have a safe suggestion yet. Your observations are still useful.</p>
          <button type="button" onClick={showPitReport}>Show my Pit Report</button>
        </section>
      ) : (
        <NextSafeTest hypotheses={result.hypotheses} investigationId={investigationId} onRecord={() => setTestRecords(getTestRecords(investigationId))} onShowPitReport={showPitReport} />
      )}

      <details className="possible-causes">
        <summary>Why this step? See possible causes</summary>
        <div className="results-head">
          <div>
            <p className="eyebrow">Suggestions, not confirmed facts</p>
            <h2>Things that might be happening</h2>
          </div>
          <DTagChips tags={result.dTags} />
        </div>
        <DelegationPanel total={total} done={done} />
        <ol className="hyp-list">
          {result.hypotheses.map((hypothesis, index) => {
            const id = `${hypothesis.area}-${index + 1}`;
            return (
              <HypothesisCard
                key={id}
                hypothesis={hypothesis}
                rank={index + 1}
                checklist={checklists[id]}
                onChecklist={(next) => setChecklists((previous) => ({ ...previous, [id]: next }))}
                onOpenRef={openRefWith}
              />
            );
          })}
        </ol>
      </details>

      <div ref={pitReportRef} className="pit-report-anchor">
        <HandoffCard intake={intake} hypotheses={result.hypotheses} checklists={checklists} testRecords={testRecords} />
      </div>
      <FixesLog />
      <RefDrawer refId={openRef} provenance={openProv} onClose={() => setOpenRef(null)} />
    </section>
  );
}
