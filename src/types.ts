// Shared frontend types for BotMentor. The serverless function (api/diagnose.ts) defines
// its own identical copies because Vercel's bundler externalizes relative imports inside
// api/ — keep these shapes in sync with that file's Hypothesis/DiagnoseResult.
export type FaultArea =
  | 'motor'
  | 'sensors'
  | 'power'
  | 'wiring'
  | 'programming'
  | 'mechanical'
  | 'radio';

export type DTag = 'Delegation' | 'Description' | 'Discernment' | 'Diligence';

export interface Ref {
  id: string;
  title: string;
  area: string;
  tags: string[];
  summary: string;
  body: string;
  snippet?: string;
}

export interface Hypothesis {
  area: FaultArea;
  title: string;
  plainSteps: string[];
  confidence: number;
  verifyFirst: boolean;
  whyRanked: string;
  refs?: string[];
}

export interface DiagnoseResult {
  hypotheses: Hypothesis[];
  dTags: DTag[];
  note?: string;
}
