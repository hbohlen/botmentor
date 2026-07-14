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
  verifyFirst: boolean; // Discernment flag
  whyRanked: string; // teaches Discernment
}

export interface DiagnoseResult {
  hypotheses: Hypothesis[];
  dTags: DTag[]; // which 4D skills this response demonstrates
  note?: string; // mentor framing / safety note
}

export interface ModelMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModelProvider {
  name: 'mock' | 'anthropic' | 'openai-compatible';
  diagnose(userInput: string): Promise<DiagnoseResult>;
}

export const FAULT_AREAS: FaultArea[] = [
  'motor',
  'sensors',
  'power',
  'wiring',
  'programming',
  'mechanical',
  'radio',
];
