// Violates infrastructure-implements-ports: an adapter reaches up into a use case.
import { GetCompany } from '../application/get-company.js';

export type Wrapped = GetCompany;
