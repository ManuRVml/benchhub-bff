// Violates infrastructure-not-from-presentation-application: application uses a concrete adapter.
import { InMemoryCompanyRepository } from '../infrastructure/in-memory-company-repository.js';

export const companies = new InMemoryCompanyRepository();
