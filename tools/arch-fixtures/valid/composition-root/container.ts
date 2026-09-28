import { GetCompany } from '../application/get-company.js';
import { appConfig } from '../config/app-config.js';
import { InMemoryCompanyRepository } from '../infrastructure/in-memory-company-repository.js';
import { CompanyPresenter } from '../presentation/company-presenter.js';

export function createContainer(): { readonly companyPresenter: CompanyPresenter } {
  const companies = new InMemoryCompanyRepository(appConfig);
  return { companyPresenter: new CompanyPresenter(new GetCompany(companies)) };
}
