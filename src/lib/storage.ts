export interface FeedbackEntry {
  hypothesisId: string;
  area: string;
  worked: 'yes' | 'no' | 'partial';
  ts: number;
}

const KEY = 'botmentor:feedback';

// MVP persistence (Q5 resolved: localStorage). Local only; survives reload. Upgrade path:
// SQLite/file later so the loop outlives browser clears.
export function recordFeedback(entry: Omit<FeedbackEntry, 'ts'>) {
  try {
    const raw = localStorage.getItem(KEY);
    const list: FeedbackEntry[] = raw ? JSON.parse(raw) : [];
    list.push({ ...entry, ts: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore storage errors (private mode, etc.) */
  }
}

export function getFeedback(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FeedbackEntry[]) : [];
  } catch {
    return [];
  }
}
