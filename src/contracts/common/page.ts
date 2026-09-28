import { z } from 'zod';

/** Paged list envelope (brief L278): `pageSchema(itemSchema)` → `{ items, page, pageSize, totalItems }`. */
export function pageSchema<Item extends z.ZodType>(item: Item) {
  return z
    .object({
      items: z.array(item),
      page: z.number().int().min(1),
      pageSize: z.number().int().min(1),
      totalItems: z.number().int().min(0),
    })
    .strict();
}

export interface Page<Item> {
  items: Item[];
  page: number;
  pageSize: number;
  totalItems: number;
}
