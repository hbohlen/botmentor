export interface HandoffHypothesis {
  id: string;
  rank: number;
  area: string;
  title: string;
  verifyFirst: boolean;
  steps: string[];
  checked: boolean[];
}

export interface HandoffInput {
  intake: string;
  hypotheses: HandoffHypothesis[];
  testRecords?: Array<{
    hypothesisId: string;
    step: string;
    prediction?: string;
    outcome: 'completed' | 'not-safe' | 'need-help';
    result?: string;
  }>;
}

/**
 * Builds a portable case brief without identities, telemetry, or account data.
 * It lets a teacher, volunteer, or teammate continue the student's evidence trail.
 */
export function buildHandoffBrief({ intake, hypotheses, testRecords = [] }: HandoffInput): string {
  const cases = hypotheses.map((hypothesis) => {
    const complete = hypothesis.checked.filter(Boolean).length;
    const marker = hypothesis.verifyFirst ? ' · Verify first' : '';
    return [
      `${hypothesis.rank}. ${capitalize(hypothesis.area)} — ${hypothesis.title}${marker}`,
      `   Progress: ${complete}/${hypothesis.steps.length} student-led checks complete`,
      ...hypothesis.steps.map((step, index) =>
        `   ${hypothesis.checked[index] ? '[x]' : '[ ]'} ${step}`
      ),
    ].join('\n');
  });
  const recordedEvidence = testRecords.map((record) => [
    `- Check: ${record.step}`,
    `  Outcome: ${record.outcome}`,
    ...(record.prediction ? [`  Prediction: ${record.prediction}`] : []),
    ...(record.result ? [`  Result: ${record.result}`] : []),
  ].join('\n'));

  return [
    'BotMentor mentor handoff',
    '',
    'Student report',
    intake.trim() || 'No written report captured.',
    '',
    'What BotMentor suggested',
    cases.length > 0 ? cases.join('\n\n') : 'No hypotheses were generated.',
    '',
    'Student-recorded evidence',
    recordedEvidence.length > 0 ? recordedEvidence.join('\n\n') : 'No test result recorded yet.',
    '',
    'Safety: pause for heat, exposed wiring, or an unsure step; involve an adult/mentor.',
    'Privacy: No student identity or account data is included.',
    '',
    'Use this brief to ask what was observed, choose the next lowest-risk test, and let the student perform the hands-on work.',
  ].join('\n');
}

function capitalize(value: string): string {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}
