import { z } from 'zod'

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export const createBookingSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(DATE_RE, 'Fecha inválida'),
  time: z.string().regex(TIME_RE, 'Hora inválida'),
  name: z.string().trim().min(3, 'Nombre muy corto').max(120),
  phone: z.string().trim().min(7, 'Teléfono inválido').max(20),
  whatsapp: z.string().trim().max(20).nullable().optional(),
  email: z
    .string()
    .trim()
    .email('Correo inválido')
    .max(160)
    .nullable()
    .optional()
    .or(z.literal('')),
  notes: z.string().trim().max(600).nullable().optional(),
})

export const loginSchema = z.object({
  email: z.string().trim().email('Correo inválido').max(160),
  password: z.string().min(8).max(128),
})

export const updateStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
})

export const serviceInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(400).nullable().optional(),
  price: z.number().int().min(0).max(10_000_000),
  durationMin: z.number().int().min(15).max(600),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(1000).default(0),
})

export const serviceUpdateSchema = serviceInputSchema.partial()

export const hourInputSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(TIME_RE),
  closeTime: z.string().regex(TIME_RE),
  isOpen: z.boolean(),
})

export const blockedInputSchema = z.object({
  date: z.string().regex(DATE_RE, 'Fecha inválida'),
  startTime: z.string().regex(TIME_RE).optional(),
  endTime: z.string().regex(TIME_RE).optional(),
  reason: z.string().trim().max(200).nullable().optional(),
  allDay: z.boolean().default(false),
})

export const settingsUpdateSchema = z.object({
  businessName: z.string().trim().min(2).max(80).optional(),
  barberName: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().min(6).max(20).optional(),
  whatsapp: z.string().trim().min(6).max(20).optional(),
  address: z.string().trim().max(200).optional(),
  instagram: z.string().trim().max(200).optional(),
  statsCustomers: z.string().trim().max(40).optional(),
  statsYears: z.string().trim().max(40).optional(),
  statsRating: z.string().trim().max(40).optional(),
})
