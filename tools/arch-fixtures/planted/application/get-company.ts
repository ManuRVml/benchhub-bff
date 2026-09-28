import { displayName } from '../domain/company.js';
import type { CompanyRepository } from '../ports/company-repository.js';

export interface CompanySummary {
  readonly id: string;
  readonly label: string;
}

export class GetCompany {
  constructor(private readonly companies: CompanyRepository) {}

  async execute(id: string): Promise<CompanySummary | undefined> {
    const company = await this.companies.findById(id);
    return company ? { id: company.id, label: displayName(company) } : undefined;
  }
}
