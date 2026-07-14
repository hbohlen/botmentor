export type FaultArea =
  | 'motor'
  | 'sensors'
  | 'power'
  | 'wiring'
  | 'programming'
  | 'mechanical'
  | 'radio';

export type DTag = 'Delegation' | 'Description' | 'Discernment' | 'Diligence';

export interface Hypothesis {
  id: string;
  area: FaultArea;
  title: string;
  plainSteps: string[];
  confidence: number; // 0..1
  verifyFirst: boolean; // Discernment: test this cheap/safe thing before others
  whyRanked: string;
}

export interface DiagnoseResult {
  hypotheses: Hypothesis[];
  dTags: DTag[];
  note?: string;
}

export interface ModelMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModelProvider {
  diagnose(input: string): Promise<DiagnoseResult>;
}
