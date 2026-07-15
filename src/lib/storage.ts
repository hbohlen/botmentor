export interface FeedbackEntry {
  hypothesisId: string;
  area: string;
  worked: 'yes' | 'no' | 'partial';
  ts: number;
}

const FEEDBACK_KEY = 'botmentor:feedback';
const CHECK_KEY = 'botmentor:checklist';
const HANDOFF_KEY = 'botmentor:handoffs';

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

export function getAllChecklists(): Record<string, boolean[]> {
  try {
    const raw = localStorage.getItem(CHECK_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean[]>) : {};
  } catch {
    return {};
  }
}

export function recordHandoff() {
  try {
    const current = Number(localStorage.getItem(HANDOFF_KEY) ?? '0');
    localStorage.setItem(HANDOFF_KEY, String(Number.isFinite(current) ? current + 1 : 1));
  } catch {
    /* ignore */
  }
}

export function getHandoffs(): number {
  try {
    const count = Number(localStorage.getItem(HANDOFF_KEY) ?? '0');
    return Number.isFinite(count) && count > 0 ? count : 0;
  } catch {
    return 0;
  }
}
