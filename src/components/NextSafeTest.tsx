import { useMemo, useState } from 'react';
import { selectNextSafeTest } from '../lib/student-experience';
import { recordTest } from '../lib/storage';
import type { Hypothesis } from '../types';
import { StudentProgress } from './StudentProgress';

export type TestOutcome = 'completed' | 'not-safe' | 'need-help';

export function NextSafeTest({ hypotheses, investigationId, onRecord, onShowPitReport }: { hypotheses: Hypothesis[]; investigationId: string; onRecord: () => void; onShowPitReport: () => void }) {
  const nextTest = useMemo(
    () =>
      selectNextSafeTest(
        hypotheses.map((hypothesis, index) => ({
          id: `${hypothesis.area}-${index + 1}`,
          title: hypothesis.title,
          steps: hypothesis.plainSteps,
          safetyLevel: hypothesis.safetyLevel,
        })),
      ),
    [hypotheses],
  );
  const [prediction, setPrediction] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState('');
  const [outcome, setOutcome] = useState<TestOutcome | null>(null);

  if (!nextTest) return null;

  const needsMentor = nextTest.safetyLevel !== 'safe';

  function saveOutcome(nextOutcome: TestOutcome, actualResult?: string) {
    recordTest({
      investigationId,
      hypothesisId: nextTest!.hypothesisId,
      step: nextTest!.action,
      prediction: prediction.trim() || undefined,
      outcome: nextOutcome,
      result: actualResult?.trim() || undefined,
    });
    onRecord();
    setOutcome(nextOutcome);
  }

  if (needsMentor || outcome === 'not-safe' || outcome === 'need-help') {
    return (
      <section className="next-test mentor-stop" aria-labelledby="mentor-stop-title">
        <StudentProgress stage="next-step" />
        <p className="eyebrow">Good troubleshooting</p>
        <h2 id="mentor-stop-title">This check needs a mentor</h2>
        <p>
          You have already gathered useful information. Pause here and show a mentor what you noticed—asking for help is the safe next step.
        </p>
        <button type="button" onClick={onShowPitReport}>Show my Pit Report</button>
      </section>
    );
  }

  if (outcome === 'completed') {
    return (
      <section className="next-test next-step-card" aria-labelledby="next-step-title">
        <StudentProgress stage="next-step" />
        <p className="eyebrow">Evidence saved</p>
        <h2 id="next-step-title">Nice work—you completed a safe check</h2>
        <p>
          This result is evidence, not proof of a cause. Review the possible causes below or share your Pit Report with a mentor.
        </p>
        <button type="button" onClick={onShowPitReport}>Show my Pit Report</button>
      </section>
    );
  }

  if (checking) {
    return (
      <section className="next-test" aria-labelledby="test-result-title">
        <StudentProgress stage="check-result" />
        <p className="eyebrow">Your observation matters</p>
        <h2 id="test-result-title">What happened?</h2>
        <label className="result-label">
          Describe what you saw, heard, or felt
          <textarea value={result} onChange={(event) => setResult(event.target.value)} placeholder="Example: The left wheel still did not move." />
        </label>
        <div className="outcome-grid">
          <button type="button" disabled={!result.trim()} onClick={() => saveOutcome('completed', result)}>Save what happened</button>
          <button type="button" className="secondary-action" onClick={() => saveOutcome('completed', "I found something wrong during the check.")}>I found something wrong</button>
          <button type="button" className="quiet-action" onClick={() => saveOutcome('need-help')}>I’m not sure</button>
        </div>
      </section>
    );
  }

  return (
    <section className="next-test" aria-labelledby="next-test-title">
      <StudentProgress stage="safe-check" />
      <p className="eyebrow">Let’s check this first</p>
      <h2 id="next-test-title">{nextTest.action}</h2>
      <div className="safety-condition"><strong>Safe-test rule:</strong> Stop if anything feels hot, damaged, sharp, or unfamiliar.</div>
      <p><strong>Why this first?</strong> It is a safe, simple way to gather evidence about “{nextTest.hypothesisTitle}.”</p>
      <label className="prediction-label">
        <span><strong>Make a guess</strong> <small>(optional)</small></span>
        <span>What do you think will happen?</span>
        <input value={prediction} onChange={(event) => setPrediction(event.target.value)} placeholder="I think…" />
      </label>
      <div className="outcome-grid">
        <button type="button" onClick={() => setChecking(true)}>I can check this</button>
        <button type="button" className="secondary-action" onClick={() => saveOutcome('need-help')}>I need a mentor</button>
        <button type="button" className="quiet-action" onClick={() => saveOutcome('not-safe')}>This doesn’t feel safe</button>
      </div>
    </section>
  );
}
