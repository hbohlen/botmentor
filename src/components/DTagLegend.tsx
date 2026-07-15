import type { DTag } from '../types';
import { DTagChips } from './DTagChips';

const LEGEND: { tag: DTag; blurb: string }[] = [
  {
    tag: 'Delegation',
    blurb: 'The tool proposes the test; the student runs it. It never pretends to touch the robot.',
  },
  {
    tag: 'Description',
    blurb: 'A clear problem description leads to a good answer — that is why the form coaches the wording.',
  },
  {
    tag: 'Discernment',
    blurb: 'Each idea carries a confidence and a "verify this first" flag, with a reason it is ranked there.',
  },
  {
    tag: 'Diligence',
    blurb: 'Safety notes (batteries, soldering, sharp parts) and honest "I am not sure" when confidence is low.',
  },
];

// Static teaching overlay. A non-technical program lead can read the screen and
// understand the method without an engineer present — part of the "enable the org"
// handoff story for the Claude Corps fellowship.
export function DTagLegend() {
  return (
    <details className="legend">
      <summary>What do the 4D tags mean?</summary>
      <div className="legend-grid">
        {LEGEND.map(({ tag, blurb }) => (
          <div key={tag} className="legend-item">
            <DTagChips tags={[tag]} />
            <p>{blurb}</p>
          </div>
        ))}
      </div>
    </details>
  );
}
