// Violates ports-only-domain: a port depends on an application type.
import type { CompanySummary } from '../application/get-company.js';

export interface SummaryCache {
  get(id: string): Promise<CompanySummary | undefined>;
}
