import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyColorKeySchema } from '../common/companies.js';
import { commaListSchema } from '../common/query.js';
import { UnitCodeSchema } from '../common/units.js';

import {
  presentationLanguageSchema,
  presentationTemplateIdSchema,
  templateAccentKeySchema,
} from './presentations-shared.js';

// V-42 — Presentation slides: GET /api/v1/views/presentation-slides/:presentationId
// (docs/requirements/view-data-contracts/V-42-presentation-slides.md). Ready-to-paint slide list for the shared
// renderer (docs/design/slide-renderer.md): a discriminated union of 14 slide kinds. Single SectionResult for the deck in
// the prose; the example is the bare payload.

const pctSchema = z.number().min(0).max(100);
// Totals of declared weights may exceed 100 (CF-65).
const totalPctSchema = z.number().min(0);

/** Members every painted slide carries. `pageLabel` is "{n} / {total}", counting cover and closing. */
const slideBase = {
  key: z.string().min(1),
  label: z.string(),
  moduleLabel: z.string(),
  pageLabel: z.string().regex(/^\d+ \/ \d+$/),
  note: z.string().optional(),
};

const slide = <Kind extends string, Shape extends z.ZodRawShape>(kind: Kind, shape: Shape) =>
  z.object({ ...slideBase, kind: z.literal(kind), ...shape }).strict();

const dimensionPctRow = {
  companyName: z.string(),
  financieraPct: pctSchema,
  operativaPct: pctSchema,
  transversalPct: pctSchema,
};

export const v42SlideSchema = z.discriminatedUnion('kind', [
  // The template name comes from the top-level templateName.
  slide('title', { subtitle: z.string() }),
  slide('bars', {
    title: z.string(),
    rows: z.array(
      z
        .object({
          indicatorLabel: z.string(),
          ecopetrolValue: z.number(),
          peerAverageValue: z.number(),
          unit: UnitCodeSchema,
        })
        .strict(),
    ),
    maxAbs: z.number().min(0),
  }),
  slide('table', {
    title: z.string(),
    rows: z.array(
      z
        .object({
          categoryLabel: z.string(),
          indicatorLabel: z.string(),
          ecopetrolValue: z.number(),
          peerAverageValue: z.number(),
          unit: UnitCodeSchema,
        })
        .strict(),
    ),
  }),
  slide('pvc', {
    companyName: z.string(),
    companyColorKey: companyColorKeySchema,
    title: z.string(),
    rows: z.array(
      z
        .object({
          indicatorLabel: z.string(),
          ecopetrolValue: z.number(),
          companyValue: z.number(),
          unit: UnitCodeSchema,
          maxAbs: z.number().min(0),
        })
        .strict(),
    ),
  }),
  slide('hom', {
    cards: z.array(
      z
        .object({
          companyName: z.string(),
          coveragePct: pctSchema,
          tone: z.enum(['complete', 'review', 'incomplete']),
          missingCount: z.number().int().min(0),
        })
        .strict(),
    ),
  }),
  slide('homMissing', {
    rows: z.array(
      z
        .object({
          companyName: z.string(),
          missingCount: z.number().int().min(0),
          coveragePct: pctSchema,
        })
        .strict(),
    ),
  }),
  slide('radar', {
    rows: z.array(
      z
        .object({
          dimensionLabel: z.string(),
          ecopetrolWeightPct: pctSchema,
          peerAverageWeightPct: pctSchema,
        })
        .strict(),
    ),
  }),
  // AI findings (OQ-19): at most 5, always a suggestion.
  slide('hallazgos', {
    findings: z.array(z.object({ text: z.string() }).strict()).max(5),
    status: z.literal('suggestion'),
  }),
  slide('summary', {
    ecopetrolWeightPct: z
      .object({ financiera: pctSchema, operativa: pctSchema, transversal: pctSchema })
      .strict(),
    summaryText: z.string(),
  }),
  // Top 4.
  slide('ranking', {
    rows: z
      .array(
        z
          .object({
            rank: z.number().int().min(1),
            companyName: z.string(),
            totalWeightPct: totalPctSchema,
            isEcopetrol: z.boolean(),
            barPct: pctSchema,
          })
          .strict(),
      )
      .max(4),
  }),
  // Ecopetrol + top 2.
  slide('categories', {
    rows: z.array(z.object({ ...dimensionPctRow, isEcopetrol: z.boolean() }).strict()).max(3),
  }),
  slide('findings', {
    rows: z.array(z.object({ ...dimensionPctRow, totalPct: totalPctSchema }).strict()),
  }),
  slide('appendix', { supportEmail: z.email() }),
  // Nothing selected: the list is exactly [{ kind: 'empty' }], with no other member.
  z.object({ kind: z.literal('empty') }).strict(),
]);

export const v42ResponseSchema = z
  .object({
    templateId: presentationTemplateIdSchema,
    templateName: z.string(),
    accentKey: templateAccentKeySchema,
    language: presentationLanguageSchema,
    slides: z.array(v42SlideSchema),
    // canReorder (OVL-06 ▲ / ▼ and "Restablecer").
    permissions: ActionPermissionsSchema,
  })
  .strict();

// Query: `order` previews an unsaved OVL-06 reorder as a comma list of slide keys; empty or absent = the saved order.
export const v42QuerySchema = z
  .object({
    order: commaListSchema(z.string().min(1)),
  })
  .strict();

export type V42Slide = z.infer<typeof v42SlideSchema>;
export type V42Response = z.infer<typeof v42ResponseSchema>;
export type V42Query = z.infer<typeof v42QuerySchema>;
