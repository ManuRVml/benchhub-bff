import type { AppConfig } from '../config/app-config.js';
import type { Company } from '../domain/company.js';
import type { CompanyRepository } from '../ports/company-repository.js';

export class InMemoryCompanyRepository implements CompanyRepository {
  private readonly companies: ReadonlyMap<string, Company>;

  constructor(config: AppConfig) {
    this.companies = new Map(
      config.seedCompanies.map((seed) => [
        seed.id,
        { ...seed, isEcopetrol: seed.id === 'ecopetrol' },
      ]),
    );
  }

  findById(id: string): Promise<Company | undefined> {
    return Promise.resolve(this.companies.get(id));
  }
}
