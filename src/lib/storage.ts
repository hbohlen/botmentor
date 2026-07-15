export interface FeedbackEntry {
  hypothesisId: string;
  area: string;
  worked: 'yes' | 'no' | 'partial';
  ts: number;
}

const FEEDBACK_KEY = 'botmentor:feedback';
const CHECK_KEY = 'botmentor:checklist';

// MVP persistence (Q5 resolved: localStorage). Local only; survives reload. Upgrade path:
// SQLite/file later so the feedback loop survives browser clears.
export function recordFeedback(entry: Omit<FeedbackEntry, 'ts'>) {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    const list: FeedbackEntry[] = raw ? JSON.parse(raw) : [];
    list.push({ ...entry, ts: Date.now() });
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list));
  } catch {
    /* ignore storage errors (private mode, etc.) */
  }
}

export function getFeedback(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    return raw ? (JSON.parse(raw) as FeedbackEntry[]) : [];
  } catch {
    return [];
  }
}

// Delegation split: which hands-on test steps (plainSteps) the student has ticked off.
// Persisted per hypothesis so the mentoring progress survives reload. See ADR-007.
export function getChecklist(id: string): boolean[] | null {
  try {
    const raw = localStorage.getItem(CHECK_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, boolean[]>;
    return map[id] ?? null;
  } catch {
    return null;
  }
}

export function setChecklist(id: string, state: boolean[]) {
  try {
    const raw = localStorage.getItem(CHECK_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, boolean[]>) : {};
    map[id] = state;
    localStorage.setItem(CHECK_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}
