// * app\utils\schemas.ts

import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';

export const singlePlaceSchema = z.object({
  id: z.string().min(1, 'El ID es obligatorio'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  cuisine: z.string().min(1, 'La cocina es obligatoria'),
  cuisineGroup: z.string().min(1, 'El grupo de cocina es obligatorio'),
  specialty: z.string().min(1, 'La especialidad es obligatoria'),
  area: z.string().min(1, 'El área/barrio es obligatoria'),
  address: z.string().min(1, 'La dirección es obligatoria'),
  lat: z.number(),
  lng: z.number(),
  priceLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  status: z.enum(['ranked', 'want']),
  rank: z.number().positive().nullable(),
  visits: z.number().int().nonnegative(),
  tags: z.array(z.string()),
  note: z.string(),
  photo: z.string().nullable().or(z.null()),
  website: z.string().url('Debe ser una URL válida').nullable(),
  dateAdded: z.string(),
});

export const singleComparisonSchema = z.object({
  aId: z.string(),
  bId: z.string(),
  result: z.enum(['a', 'b', 'tie']),
  date: z.string(),
});

export const PlaceSchema = z.object({
  meta: z.object({
    city: z.string(),
    center: z.object({ lat: z.number(), lng: z.number() }),
    defaultZoom: z.number(),
    generatedFor: z.string(),
    priceLevels: z.object({
      1: z.string(),
      2: z.string(),
      3: z.string(),
      4: z.string(),
    }),
    cuisineGroups: z.array(z.string()),
  }),
  places: z.array(singlePlaceSchema),
  comparisons: z.array(singleComparisonSchema),
});

// Listos para Vee-Validate en tus componentes
export const formPlaceValidation = toTypedSchema(singlePlaceSchema);
export const formComparisonValidation = toTypedSchema(singleComparisonSchema);
