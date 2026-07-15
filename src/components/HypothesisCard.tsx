import { useState } from 'react';
import type { Hypothesis } from '../types';
import { recordFeedback } from '../lib/storage';
import { ActionChecklist } from './ActionChecklist';
import { ConfidenceBar } from './ConfidenceBar';
import { CritiquePanel } from './CritiquePanel';
import { RefChip } from './RefChip';

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
  onOpenRef: (id: string) => void;
}) {
  const [feedback, setFeedback] = useState<'yes' | 'no' | 'partial' | null>(null);
  const [challenge, setChallenge] = useState(false);
  const id = `${hypothesis.area}-${rank}`;

  function choose(v: 'yes' | 'no' | 'partial') {
    setFeedback(v);
    recordFeedback({ hypothesisId: id, area: hypothesis.area, worked: v });
  }

  return (
    <li className="hyp">
      <div className="ai-part">🤖 Claude suggests</div>
      <div className="hyp-head">
        <span className="rank">#{rank}</span>
        <span className="area">{hypothesis.area}</span>
        <span className="title">{hypothesis.title}</span>
        <ConfidenceBar value={Math.round((hypothesis.confidence ?? 0) * 100)} />
      </div>
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
              onClick={() => onOpenRef(rid)}
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
    </li>
  );
}
