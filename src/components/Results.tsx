import type { DTag, DiagnoseResult } from '../types';
import { DTagChips } from './DTagChips';
import { HypothesisCard } from './HypothesisCard';

export function Results({ result }: { result: DiagnoseResult }) {
  return (
    <section className="results">
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
        {result.hypotheses.map((h, i) => (
          <HypothesisCard key={i} hypothesis={h} rank={i + 1} />
        ))}
      </ol>
    </section>
  );
}
