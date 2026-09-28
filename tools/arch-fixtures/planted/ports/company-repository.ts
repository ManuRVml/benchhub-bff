import type { Company } from '../domain/company.js';

export interface CompanyRepository {
  findById(id: string): Promise<Company | undefined>;
}
