// Violates no-circular (with bad-cycle-a.ts).
import { a } from './bad-cycle-a.js';

export const b = (): string => (a.length > 0 ? 'b' : '');
