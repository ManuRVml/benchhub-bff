import { z } from 'zod';

/**
 * Company colour key (CF-98): the bare company slug (`chevron`, `shell`, `totalenergies`), which the web maps to its
 * `company.*` colour token. The contracts give no closed company list (peers are configurable per analysis), so v1
 * validates the slug form instead of an enum. Chart and aspiration colour keys (`chart.category.*`, `aspiration.*`)
 * are token paths, not company keys, and do not use this schema.
 */
export const companyColorKeySchema = z.string().regex(/^[a-z0-9-]+$/);

export type CompanyColorKey = z.infer<typeof companyColorKeySchema>;
