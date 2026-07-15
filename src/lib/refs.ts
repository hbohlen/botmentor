import { useSyncExternalStore } from 'react';
import type { Ref } from '../refs';
import { TEAMS, teamLibrary } from '../teams';

// Active-team store (ADR-014): which team's reference library is loaded. Persisted to
// localStorage and shared across components via useSyncExternalStore so switching team
// re-renders every consumer (chips, drawer, browse tab) with the swapped docs.
const KEY = 'botmentor:team';
const listeners = new Set<() => void>();

function read(): string {
  try {
    const id = localStorage.getItem(KEY);
    if (id && TEAMS.some((t) => t.id === id)) return id;
  } catch {
    /* ignore */
  }
  return TEAMS[0].id;
}

export function setActiveTeam(id: string) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useActiveTeam(): string {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => TEAMS[0].id
  );
}

// Non-hook accessors resolve against the current active team's merged library.
export function getRef(id: string): Ref | undefined {
  return teamLibrary(read())[id];
}

export function allRefs(): Ref[] {
  return Object.values(teamLibrary(read()));
}
