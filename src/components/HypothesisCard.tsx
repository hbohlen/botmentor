import { useState } from 'react';
import type { Hypothesis } from '../server/providers/types';
import { recordFeedback } from '../lib/storage';

// Renders one hypothesis. Carries the Discernment flag (verifyFirst) and the whyRanked
// teaching text. "Did this work?" captures feedback -> localStorage (Diligence loop).
export function HypothesisCard({
  hypothesis,
  rank,
}: {
  hypothesis: Hypothesis;
  rank: number;
}) {
  const [feedback, setFeedback] = useState<'yes' | 'no' | 'partial' | null>(null);

  function choose(v: 'yes' | 'no' | 'partial') {
    setFeedback(v);
    recordFeedback({ hypothesisId: hypothesis.id, area: hypothesis.area, worked: v });
  }

  const pct = Math.round((hypothesis.confidence ?? 0) * 100);

  return (
    <li className="hyp">
      <div className="hyp-head">
        <span className="rank">#{rank}</span>
        <span className="area">{hypothesis.area}</span>
        <span className="title">{hypothesis.title}</span>
        <span className="conf">~{pct}% likely</span>
      </div>
      {hypothesis.verifyFirst && (
        <p className="verify">⚠ Verify this first — a cheap/safe check before swapping parts.</p>
      )}
      <ol className="steps">
        {hypothesis.plainSteps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      {hypothesis.whyRanked && (
        <details className="why">
          <summary>Why this is ranked here</summary>
          <p>{hypothesis.whyRanked}</p>
        </details>
      )}
      <div className="feedback">
        <span>Did this work?</span>
        {(['yes', 'no', 'partial'] as const).map((v) => (
          <button
            key={v}
            className={feedback === v ? 'active' : ''}
            onClick={() => choose(v)}
          >
            {v}
          </button>
        ))}
      </div>
    </li>
  );
}
