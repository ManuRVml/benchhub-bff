export interface AppConfig {
  readonly seedCompanies: readonly { readonly id: string; readonly name: string }[];
}

export const appConfig: AppConfig = {
  seedCompanies: [{ id: 'ecopetrol', name: 'Ecopetrol' }],
};
