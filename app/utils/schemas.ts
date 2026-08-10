// * app\utils\schemas.ts

import { z } from 'zod';

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

export const placeFormSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required'),
  cuisine: z.string().min(1, 'Cuisine type is required'),
  specialty: z.string().optional().default(''),
  area: z.string().min(1, 'Neighborhood is required'),
  address: z.string().min(1, 'Address is required'),
  lat: z.number({ invalid_type_error: 'Latitude must be a number' }),
  lng: z.number({ invalid_type_error: 'Longitude must be a number' }),
  priceLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  status: z.enum(['ranked', 'want']),
  note: z.string().optional().default(''),
  tags: z.string().optional().default(''),
  website: z.string().url('Must be a valid URL').or(z.literal('')).optional().default(''),
});

export type PlaceFormValues = z.infer<typeof placeFormSchema>;

export const authSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AuthFormValues = z.infer<typeof authSchema>;
