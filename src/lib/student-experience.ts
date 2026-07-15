import type { SymptomFlow } from './robot-workspace';

export type StudentStage =
  | 'choose-area'
  | 'describe-problem'
  | 'safe-check'
  | 'check-result'
  | 'next-step';

export type SafetyLevel = 'safe' | 'adult-present' | 'mentor-required';

export interface SafeTestCandidate {
  id: string;
  title: string;
  steps: string[];
  safetyLevel: SafetyLevel;
}

export interface NextSafeTestSelection {
  hypothesisId: string;
  hypothesisTitle: string;
  action: string;
  safetyLevel: SafetyLevel;
}

const STUDENT_PROGRESS: Record<StudentStage, { current: number; total: 5; label: string }> = {
  'choose-area': { current: 1, total: 5, label: 'Find the problem area' },
  'describe-problem': { current: 2, total: 5, label: 'Tell us what happened' },
  'safe-check': { current: 3, total: 5, label: 'Choose what to check first' },
  'check-result': { current: 4, total: 5, label: 'Record what happened' },
  'next-step': { current: 5, total: 5, label: 'Choose what happens next' },
};

export function getStudentProgress(stage: StudentStage) {
  return STUDENT_PROGRESS[stage];
}

export function getCurrentQuestion(flow: SymptomFlow, answers: Record<string, string>) {
  return flow.questions.find((question) => !answers[question.id]);
}

export function selectNextSafeTest(candidates: SafeTestCandidate[]): NextSafeTestSelection | undefined {
  const candidate = candidates[0];
  if (!candidate) return undefined;

  return {
    hypothesisId: candidate.id,
    hypothesisTitle: candidate.title,
    action:
      candidate.safetyLevel === 'safe'
        ? candidate.steps[0] ?? 'Observe the robot and write down what happens.'
        : 'Pause and ask a mentor to help with this check.',
    safetyLevel: candidate.safetyLevel,
  };
}
