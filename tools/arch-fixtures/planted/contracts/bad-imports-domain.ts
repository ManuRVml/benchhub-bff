// Violates contracts-self-contained: a published view model leaks a domain type.
import type { Company } from '../domain/company.js';

export interface CompanyViewModel {
  readonly company: Company;
}
