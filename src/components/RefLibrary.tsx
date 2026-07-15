import { useState } from 'react';
import { allRefs, getRef } from '../lib/refs';
import { RefDrawer } from './RefDrawer';

// Browse the robot's reference library without diagnosing — proactive learning.
// Client-side filter by area. See ADR-011.
const AREAS = ['motor', 'sensors', 'power', 'wiring', 'programming', 'mechanical', 'radio'];

export function RefLibrary() {
  const [area, setArea] = useState<string | null>(null);
  const [openRef, setOpenRef] = useState<string | null>(null);
  const refs = allRefs().filter((r) => (area ? r.area === area : true));

  return (
    <section className="reflib">
      <h2>📚 Robot reference library</h2>
      <p className="reflib-sub">
        The docs and code snippets your team can study before they’re stuck. Open any to read it.
      </p>
      <div className="ref-filters">
        <button className={area === null ? 'rf active' : 'rf'} onClick={() => setArea(null)}>
          All
        </button>
        {AREAS.map((a) => (
          <button
            key={a}
            className={area === a ? 'rf active' : 'rf'}
            onClick={() => setArea(a)}
          >
            {a}
          </button>
        ))}
      </div>
      <ul className="reflib-grid">
        {refs.map((r) => (
          <li key={r.id} className="reflib-card">
            <span className="reflib-area">{r.area}</span>
            <h3>{r.title}</h3>
            <p>{r.summary}</p>
            <button className="reflib-open" onClick={() => setOpenRef(r.id)}>
              Open →
            </button>
          </li>
        ))}
      </ul>
      <RefDrawer refId={openRef} onClose={() => setOpenRef(null)} />
    </section>
  );
}
