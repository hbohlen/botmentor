import { useMemo, useState } from 'react';
import type { Hypothesis } from '../types';
import { buildHandoffBrief } from '../lib/handoff';
import { recordHandoff } from '../lib/storage';

interface Props {
  intake: string;
  hypotheses: Hypothesis[];
  checklists: Record<string, boolean[]>;
}

export function HandoffCard({ intake, hypotheses, checklists }: Props) {
  const [copied, setCopied] = useState(false);
  const brief = useMemo(
    () =>
      buildHandoffBrief({
        intake,
        hypotheses: hypotheses.map((hypothesis, index) => {
          const id = `${hypothesis.area}-${index + 1}`;
          return {
            id,
            rank: index + 1,
            area: hypothesis.area,
            title: hypothesis.title,
            verifyFirst: hypothesis.verifyFirst,
            steps: hypothesis.plainSteps,
            checked: checklists[id] ?? hypothesis.plainSteps.map(() => false),
          };
        }),
      }),
    [intake, hypotheses, checklists]
  );

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(brief);
      recordHandoff();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <details className="handoff">
      <summary>🤝 Bring in a mentor or teacher</summary>
      <p>
        Create a privacy-preserving case brief with the student’s report, the tests completed,
        and the next evidence to collect. Nothing is uploaded or shared automatically.
      </p>
      <button className="handoff-copy" type="button" onClick={copyBrief}>
        {copied ? 'Copied case brief' : 'Copy case brief'}
      </button>
      <p className="handoff-status" aria-live="polite">
        {copied
          ? 'Ready to paste into a message, mentor queue, or team notebook.'
          : 'The student controls what leaves this browser.'}
      </p>
    </details>
  );
}
