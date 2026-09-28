// Violates presentation-only-application-contracts: presentation reads a domain type directly.
import type { Company } from '../domain/company.js';

export const toView = (company: Company): string => company.name;
