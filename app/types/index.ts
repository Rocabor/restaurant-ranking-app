// * app\types\index.ts

import { z } from 'zod';
// Aquí sí usamos la ruta manual para extraer el tipo del esquema de Zod
import { singlePlaceSchema, singleComparisonSchema, PlaceSchema } from '~/utils/schemas';

export type Place = z.infer<typeof singlePlaceSchema>;
export type Comparison = z.infer<typeof singleComparisonSchema>;
export type FullPlaceJsonData = z.infer<typeof PlaceSchema>;

export type PlaceStatus = 'ranked' | 'want';
