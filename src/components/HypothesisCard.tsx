import { useState } from 'react';
import type { Hypothesis } from '../types';
import { recordFeedback } from '../lib/storage';
import { ActionChecklist } from './ActionChecklist';
import { ConfidenceBar } from './ConfidenceBar';
import { CritiquePanel } from './CritiquePanel';
import { RefChip } from './RefChip';
import type { RefProvenance } from './RefDrawer';

export function HypothesisCard({
  hypothesis,
  rank,
  checklist,
  onChecklist,
  onOpenRef,
}: {
  hypothesis: Hypothesis;
  rank: number;
  checklist: boolean[];
  onChecklist: (next: boolean[]) => void;
  onOpenRef: (id: string, provenance: RefProvenance) => void;
}) {
  const [feedback, setFeedback] = useState<'yes' | 'no' | 'partial' | null>(null);
  const [challenge, setChallenge] = useState(false);
  const id = `${hypothesis.area}-${rank}`;
  const provenance: RefProvenance = {
    rank,
    area: hypothesis.area,
    title: hypothesis.title,
    whyRanked: hypothesis.whyRanked,
  };

  function choose(v: 'yes' | 'no' | 'partial') {
    setFeedback(v);
    recordFeedback({ hypothesisId: id, area: hypothesis.area, worked: v });
  }

  const status = feedback === 'yes' ? 'Supported by a student result' : feedback === 'no' ? 'Ruled out by a student result' : feedback === 'partial' ? 'Partly supported — keep investigating' : hypothesis.confidence < 0.45 ? 'Uncertain — mentor review may help' : 'Untested suggestion';

  return (
    <li className="hyp">
      <div className="ai-part">🤖 Claude suggests</div>
      <div className="hyp-head">
        <span className="rank">#{rank}</span>
        <span className="area">{hypothesis.area}</span>
        <span className="title">{hypothesis.title}</span>
        <ConfidenceBar value={Math.round((hypothesis.confidence ?? 0) * 100)} />
      </div>
      <p className="hyp-status" role="status">Status: {status}</p>
      <ActionChecklist
        hypothesisId={id}
        steps={hypothesis.plainSteps}
        verifyFirst={hypothesis.verifyFirst}
        checklist={checklist}
        onChange={onChecklist}
      />
      {hypothesis.refs && hypothesis.refs.length > 0 && (
        <div className="ref-chips">
          <span className="ref-label">📚 References:</span>
          {hypothesis.refs.map((rid) => (
            <RefChip
              key={rid}
              title={rid.replace(/^ref-/, '').replace(/-/g, ' ')}
              onClick={() => onOpenRef(rid, provenance)}
            />
          ))}
        </div>
      )}
      <div className="discern">
        <details className="why">
          <summary>Why this is ranked here</summary>
          <p>{hypothesis.whyRanked}</p>
        </details>
        <button className="challenge" onClick={() => setChallenge((c) => !c)}>
          {challenge ? 'Hide challenge' : '🔍 Challenge the mentor'}
        </button>
        {challenge && <CritiquePanel hypothesis={hypothesis} />}
      </div>
      <div className="feedback">
        <span>Did this work?</span>
        {(['yes', 'no', 'partial'] as const).map((v) => (
          <button key={v} className={feedback === v ? 'active' : ''} onClick={() => choose(v)}>
            {v}
          </button>
        ))}
      </div>
      {feedback && hypothesis.refs && hypothesis.refs.length > 0 && (
        <div className="learn-loop">
          <span className="learn-msg">
            {feedback === 'yes'
              ? '✅ It worked — now read why, so you can spot it faster next time:'
              : feedback === 'no'
                ? '❌ Not it — study why this was likely, then move to the next idea:'
                : '🤔 Partly — read the docs to see what else could be going on:'}
          </span>
          <div className="ref-chips">
            {hypothesis.refs.map((rid) => (
              <RefChip
                key={rid}
                title={rid.replace(/^ref-/, '').replace(/-/g, ' ')}
                onClick={() => onOpenRef(rid, provenance)}
              />
            ))}
          </div>
        </div>
      )}
    </li>
  );
}
