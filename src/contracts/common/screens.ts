import { z } from 'zod';

/**
 * The 12 in-shell screens by their route slug (CF-112): the Yarbis panel context of C-33 and the saved-view screen of
 * C-19. V-46 keeps its own list and V-47 its `value-monitor` slug (open divergences).
 */
export const shellScreenSchema = z.enum([
  'inicio',
  'analisis',
  'definicion',
  'resultados',
  'visualizacion',
  'detalle-indicador',
  'monitor-valor',
  'sensibilidades',
  'presentaciones',
  'presentacion-detalle',
  'notificaciones',
  'configuracion',
]);

export type ShellScreen = z.infer<typeof shellScreenSchema>;
