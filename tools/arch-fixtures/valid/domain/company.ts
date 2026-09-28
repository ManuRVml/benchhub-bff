export interface Company {
  readonly id: string;
  readonly name: string;
  readonly isEcopetrol: boolean;
}

export function displayName(company: Company): string {
  return company.isEcopetrol ? `${company.name} (referencia)` : company.name;
}
