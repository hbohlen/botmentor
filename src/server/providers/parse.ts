import type { DiagnoseResult } from './types';

// Defensive JSON extraction: the model may wrap the JSON in prose or code fences.
// We find the first '{' and last '}' and parse that span. On any failure, return a
// safe, honest fallback so the UI never breaks (Diligence: catch your own wrong answers).
export function parseDiagnose(text: string): DiagnoseResult {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) throw new Error('no json');
    const json = text.slice(start, end + 1);
    const parsed = JSON.parse(json) as Partial<DiagnoseResult>;
    if (!Array.isArray(parsed.hypotheses)) throw new Error('bad shape');
    return {
      hypotheses: parsed.hypotheses.map((h, i) => ({
        id: h.id ?? `h${i + 1}`,
        area: h.area ?? 'mechanical',
        title: h.title ?? 'Unknown',
        plainSteps: Array.isArray(h.plainSteps) ? h.plainSteps : [],
        confidence: typeof h.confidence === 'number' ? h.confidence : 0.5,
        verifyFirst: Boolean(h.verifyFirst),
        whyRanked: h.whyRanked ?? '',
      })),
      dTags: Array.isArray(parsed.dTags) ? parsed.dTags : [],
      note: parsed.note,
    };
  } catch {
    return {
      hypotheses: [],
      dTags: ['Discernment'],
      note:
        "I wasn't confident enough to answer safely from that description. Try adding what changed and what you expected to happen — a clearer description helps me help you.",
    };
  }
}
