import type { DiagnoseResult } from './types';

// Defensive JSON extraction: the model may wrap the JSON in prose or code fences.
// We find the first '{' and last '}' and parse that span. On any failure we return a
// safe, clearly-labeled result rather than throwing — the UI can still render it.
export function parseDiagnose(raw: string): DiagnoseResult {
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      throw new Error('no JSON object found');
    }
    const json = raw.slice(start, end + 1);
    const parsed = JSON.parse(json) as Partial<DiagnoseResult>;
    return {
      hypotheses: Array.isArray(parsed.hypotheses) ? parsed.hypotheses : [],
      dTags: Array.isArray(parsed.dTags)
        ? (parsed.dTags as DiagnoseResult['dTags'])
        : ['Delegation', 'Description', 'Discernment', 'Diligence'],
      note: parsed.note,
    };
  } catch {
    return {
      hypotheses: [],
      dTags: ['Delegation', 'Description', 'Discernment', 'Diligence'],
      note: 'The mentor could not parse a structured answer. Try restating the symptom, what changed, and what you expected.',
    };
  }
}
