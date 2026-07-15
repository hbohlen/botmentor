import type { FeedbackEntry } from './storage';

export interface ImpactSnapshot {
  attemptedIdeas: number;
  completedChecks: number;
  totalChecks: number;
  mentorHandoffs: number;
  worked: number;
  partial: number;
  notWorked: number;
  privacyNote: string;
}

/**
 * Aggregates only browser-local, de-identified signals. This is a reflection aid,
 * not an outcome claim or student-tracking system.
 */
export function buildImpactSnapshot({
  feedback,
  checklists,
  handoffs,
}: {
  feedback: FeedbackEntry[];
  checklists: Record<string, boolean[]>;
  handoffs: number;
}): ImpactSnapshot {
  const checks = Object.values(checklists).flat();
  return {
    attemptedIdeas: feedback.length,
    completedChecks: checks.filter(Boolean).length,
    totalChecks: checks.length,
    mentorHandoffs: handoffs,
    worked: feedback.filter((entry) => entry.worked === 'yes').length,
    partial: feedback.filter((entry) => entry.worked === 'partial').length,
    notWorked: feedback.filter((entry) => entry.worked === 'no').length,
    privacyNote: 'Local-only and de-identified: no student names, accounts, or telemetry.',
  };
}
