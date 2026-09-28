// Violates domain-no-external: domain depends on a vendor SDK.
import { DBSQLClient } from '@databricks/sql';

export const client = new DBSQLClient();
