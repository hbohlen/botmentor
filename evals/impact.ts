// Deterministic, privacy-first eval for the nonprofit program-lead snapshot.
// It must summarize only locally stored, de-identified learning signals.
import { buildImpactSnapshot } from '../src/lib/impact';

const snapshot = buildImpactSnapshot({
  feedback: [
    { hypothesisId: 'wiring-1', area: 'wiring', worked: 'yes', ts: 1 },
    { hypothesisId: 'motor-2', area: 'motor', worked: 'partial', ts: 2 },
    { hypothesisId: 'wiring-3', area: 'wiring', worked: 'no', ts: 3 },
  ],
  checklists: {
    'wiring-1': [true, true, false],
    'motor-2': [true, false],
  },
  handoffs: 2,
});

const expected = {
  attemptedIdeas: 3,
  completedChecks: 3,
  totalChecks: 5,
  mentorHandoffs: 2,
  worked: 1,
  privacyNote: 'Local-only and de-identified: no student names, accounts, or telemetry.',
};

for (const [key, value] of Object.entries(expected)) {
  if (snapshot[key as keyof typeof snapshot] !== value) {
    console.error(`Expected ${key}=${value}; got ${String(snapshot[key as keyof typeof snapshot])}`);
    process.exit(1);
  }
}

console.log('✓ impact snapshot reports de-identified local learning signals only');
