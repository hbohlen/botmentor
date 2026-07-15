interface Props {
  total: number;
  done: number;
}

// Top-of-results teaching artifact for the 4D "Delegation" competency: makes the
// AI-vs-student boundary tangible. Claude works out the causes; the student runs the
// tests. The progress bar shows the student's hands-on work — the mentoring itself.
export function DelegationPanel({ total, done }: Props) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="delegation">
      <div className="delegation-legend">
        <span className="chip-ai">🤖 Claude works out the causes</span>
        <span className="chip-you">✋ You run the tests</span>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <p className="progress-label">
        Your hands-on progress: {done} / {total} test steps done — the mentoring happens here.
      </p>
    </div>
  );
}
