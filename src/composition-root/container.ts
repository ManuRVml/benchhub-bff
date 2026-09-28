import type { Env } from '../config/env.js';

// Composition root (ADR-0001, brief L241): the only place that instantiates concrete classes. For now it carries the
// validated env; P4 adds the providers behind the ports.
export interface Container {
  readonly env: Env;
}

export function createContainer(env: Env): Container {
  return Object.freeze({ env });
}
