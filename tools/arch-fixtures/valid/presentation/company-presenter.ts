import type { GetCompany } from '../application/get-company.js';
import type { CompanyView } from '../contracts/company-view.js';

export class CompanyPresenter {
  constructor(private readonly getCompany: GetCompany) {}

  async present(id: string): Promise<CompanyView | undefined> {
    const summary = await this.getCompany.execute(id);
    return summary ? { id: summary.id, label: summary.label } : undefined;
  }
}
