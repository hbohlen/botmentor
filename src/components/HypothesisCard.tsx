import { useState } from 'react';
import type { Hypothesis } from '../types';
import { recordFeedback } from '../lib/storage';
import { ActionChecklist } from './ActionChecklist';

export function HypothesisCard({
  hypothesis,
  rank,
  checklist,
  onChecklist,
}: {
  hypothesis: Hypothesis;
  rank: number;
  checklist: boolean[];
  onChecklist: (next: boolean[]) => void;
}) {
  const [feedback, setFeedback] = useState<'yes' | 'no' | 'partial' | null>(null);
  const id = `${hypothesis.area}-${rank}`;

  function choose(v: 'yes' | 'no' | 'partial') {
    setFeedback(v);
    recordFeedback({ hypothesisId: id, area: hypothesis.area, worked: v });
  }

  const pct = Math.round((hypothesis.confidence ?? 0) * 100);

  return (
    <li className="hyp">
      <div className="ai-part">🤖 Claude suggests</div>
      <div className="hyp-head">
        <span className="rank">#{rank}</span>
        <span className="area">{hypothesis.area}</span>
        <span className="title">{hypothesis.title}</span>
        <span className="conf">~{pct}% likely</span>
      </div>
      <ActionChecklist
        hypothesisId={id}
        steps={hypothesis.plainSteps}
        verifyFirst={hypothesis.verifyFirst}
        checklist={checklist}
        onChange={onChecklist}
      />
      {hypothesis.whyRanked && (
        <details className="why">
          <summary>Why this is ranked here</summary>
          <p>{hypothesis.whyRanked}</p>
        </details>
      )}
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
