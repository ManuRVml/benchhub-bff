// Violates no-circular (with bad-cycle-b.ts).
import { b } from './bad-cycle-b.js';

export const a = (): string => `a${b()}`;
