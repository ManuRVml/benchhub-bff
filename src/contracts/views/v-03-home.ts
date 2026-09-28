import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyColorKeySchema } from '../common/companies.js';
import { analysisIdSchema, companyIdSchema, newsIdSchema } from '../common/ids.js';
import { sectionResult } from '../common/section-result.js';
import { UnitCodeSchema } from '../common/units.js';

// V-03 — Home (Inicio): GET /api/v1/views/home (web@a5e3012 docs/design/view-data-contracts/V-03-home.md).
// Five independent sections composed by the view composer; the page never fails as a whole.

const trendSchema = z.enum(['up', 'down']);

export const v03BannerSchema = z
  .object({
    text: z.string(),
    // The banner text is an AI suggestion (CF-40); no other state is defined for v1.
    aiStatus: z.enum(['suggestion']),
  })
  .strict();

export const v03ExecutiveSummarySchema = z
  .object({
    total: z.number().int().min(0),
    active: z.number().int().min(0),
    published: z.number().int().min(0),
    inProgress: z.number().int().min(0),
    avgCoveragePct: z.number().min(0).max(100),
  })
  .strict();

export const v03EnabledAnalysisSchema = z
  .object({
    id: analysisIdSchema,
    title: z.string(),
    status: z.enum(['draft', 'in_progress', 'in_review', 'published']),
    description: z.string(),
    updatedAt: z.iso.datetime({ offset: true }),
    ownerName: z.string(),
    targetRoute: z.string().startsWith('/'),
  })
  .strict();

export const v03PeerNewsItemSchema = z
  .object({
    id: newsIdSchema,
    companyId: companyIdSchema,
    companyName: z.string(),
    colorKey: companyColorKeySchema,
    initials: z.string(),
    impact: trendSchema,
    headline: z.string(),
    source: z.string(),
  })
  .strict();

export const v03MarketIndicatorSchema = z
  .object({
    id: z.string().min(1),
    label: z.string(),
    value: z.number(),
    unit: UnitCodeSchema,
    deltaPct: z.number(),
    trend: trendSchema,
  })
  .strict();

export const v03ResponseSchema = z
  .object({
    banner: sectionResult(v03BannerSchema),
    executiveSummary: sectionResult(v03ExecutiveSummarySchema),
    enabledAnalyses: sectionResult(z.array(v03EnabledAnalysisSchema)),
    peerNews: sectionResult(z.array(v03PeerNewsItemSchema)),
    marketIndicators: sectionResult(z.array(v03MarketIndicatorSchema)),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V03Response = z.infer<typeof v03ResponseSchema>;

export const V03_SECTIONS = [
  'banner',
  'executiveSummary',
  'enabledAnalyses',
  'peerNews',
  'marketIndicators',
] as const;
