import type { Company } from '../domain/company.js';
import type { CompanyRepository } from '../ports/company-repository.js';

export class InMemoryCompanyRepository implements CompanyRepository {
  findById(_id: string): Promise<Company | undefined> {
    return Promise.resolve(undefined);
  }
}
