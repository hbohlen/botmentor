import { REFS, type Ref } from '../refs';

export function getRef(id: string): Ref | undefined {
  return REFS[id];
}

export function allRefs(): Ref[] {
  return Object.values(REFS);
}
