import { z } from 'zod';

/**
 * Unit codes the BFF sends next to raw numbers; the web formats them per locale (es-CO, brief §5.7). Exactly the
 * canonical list of docs/requirements/unit-codes.md (web@12dbc78), in its order; see docs/requirements/contract-notes.md:
 * - `percent`, `points`, `ratio_x`, `rating`, `kboe`;
 * - `usd_b`: US dollars per barrel (`71,4 USD/B`; CF-96 replaced V-03's `usd_per_bbl`);
 * - `usd_bn`: US dollars in billions (`46,1 USD bn`);
 * - `cop_per_usd`, `bcop` (billions of COP), `mmcop`, `cop`;
 * - `musd` (millions of US dollars) and `cop_per_kwh` (COP per kWh), V-30 units (CF-127).
 */
export const UNIT_CODES = [
  'percent',
  'points',
  'ratio_x',
  'rating',
  'kboe',
  'usd_b',
  'usd_bn',
  'cop_per_usd',
  'bcop',
  'mmcop',
  'cop',
  'musd',
  'cop_per_kwh',
] as const;

export const UnitCodeSchema = z.enum(UNIT_CODES);

export type UnitCode = z.infer<typeof UnitCodeSchema>;
