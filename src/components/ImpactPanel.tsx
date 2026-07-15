import { useMemo } from 'react';
import { getAllChecklists, getFeedback, getHandoffs } from '../lib/storage';
import { buildImpactSnapshot } from '../lib/impact';

export function ImpactPanel() {
  const snapshot = useMemo(
    () =>
      buildImpactSnapshot({
        feedback: getFeedback(),
        checklists: getAllChecklists(),
        handoffs: getHandoffs(),
      }),
    []
  );
  const progress = snapshot.totalChecks
    ? Math.round((snapshot.completedChecks / snapshot.totalChecks) * 100)
    : 0;

  return (
    <section className="impact" aria-labelledby="impact-heading">
      <div className="impact-head">
        <div>
          <p className="eyebrow">Program-lead view</p>
          <h2 id="impact-heading">Learning signals, not surveillance</h2>
        </div>
        <span className="impact-local">🔒 local only</span>
      </div>
      <p className="impact-intro">
        A coach or coordinator can use this browser-level snapshot to facilitate a retrospective,
        identify where a team is stuck, and decide when more mentoring is useful.
      </p>
      <div className="impact-grid">
        <Metric label="Ideas tested" value={snapshot.attemptedIdeas} hint="student feedback logged" />
        <Metric
          label="Checks completed"
          value={`${snapshot.completedChecks}/${snapshot.totalChecks}`}
          hint={`${progress}% of saved hands-on checks`}
        />
        <Metric label="Mentor handoffs" value={snapshot.mentorHandoffs} hint="case briefs copied" />
        <Metric
          label="Reported outcomes"
          value={`${snapshot.worked} yes · ${snapshot.partial} partial · ${snapshot.notWorked} no`}
          hint="a discussion starter, not a success rate"
        />
      </div>
      <aside className="impact-privacy">
        <strong>Privacy boundary</strong>
        <p>{snapshot.privacyNote} Clear your browser data to reset this view.</p>
      </aside>
    </section>
  );
}

function Metric({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}
