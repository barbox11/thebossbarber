export type AppointmentStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export interface ServiceRecord {
  id: string
  name: string
  description: string | null
  price: number
  durationMin: number
  active: boolean
  sortOrder: number
}

export interface CustomerRecord {
  id: string
  name: string
  phone: string
  whatsapp: string | null
  email: string | null
  notes: string | null
  createdAt: Date
}

export interface AppointmentRecord {
  id: string
  serviceId: string
  customerId: string
  slotStart: Date
  slotEnd: Date
  status: AppointmentStatus
  priceAtBooking: number
  durationAtBooking: number
  nameSnapshot: string
  phoneSnapshot: string
  whatsappSnapshot: string | null
  emailSnapshot: string | null
  notes: string | null
  createdAt: Date
}

export interface AppointmentWithRelations extends AppointmentRecord {
  service?: ServiceRecord
  customer?: CustomerRecord
}

export interface BusinessHourRecord {
  id: string
  dayOfWeek: number
  openTime: string
  closeTime: string
  isOpen: boolean
}

export interface BlockedTimeRecord {
  id: string
  date: Date
  startTime: string
  endTime: string
  reason: string | null
  allDay: boolean
}

export type SettingsKey =
  | 'businessName'
  | 'barberName'
  | 'phone'
  | 'whatsapp'
  | 'address'
  | 'instagram'
  | 'statsCustomers'
  | 'statsYears'
  | 'statsRating'

export type BusinessSettings = Record<SettingsKey, string>

export const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'The Boss Barber',
  barberName: 'El Maestro Barbero',
  phone: '+57 321 76550814',
  whatsapp: '+57 321 76550814',
  address: 'Cra 23 # 18-87, La Hermosa',
  instagram: '',
  statsCustomers: '+2.000',
  statsYears: '5',
  statsRating: '4.9/5',
}

export const DEFAULT_HOURS: Omit<BusinessHourRecord, 'id'>[] = [
  { dayOfWeek: 0, openTime: '00:00', closeTime: '00:00', isOpen: false },
  { dayOfWeek: 1, openTime: '09:00', closeTime: '19:00', isOpen: true },
  { dayOfWeek: 2, openTime: '09:00', closeTime: '19:00', isOpen: true },
  { dayOfWeek: 3, openTime: '09:00', closeTime: '19:00', isOpen: true },
  { dayOfWeek: 4, openTime: '09:00', closeTime: '19:00', isOpen: true },
  { dayOfWeek: 5, openTime: '09:00', closeTime: '20:00', isOpen: true },
  { dayOfWeek: 6, openTime: '09:00', closeTime: '17:00', isOpen: true },
]

export const DEFAULT_SERVICES: Omit<ServiceRecord, 'id'>[] = [
  {
    name: 'Corte',
    description: 'Corte clásico o moderno con asesoría de estilo, lavado y acabado de precisión.',
    price: 20000,
    durationMin: 45,
    active: true,
    sortOrder: 1,
  },
  {
    name: 'Corte + Barba',
    description: 'Corte completo más perfilado de barba con toalla caliente y acabado premium.',
    price: 40000,
    durationMin: 60,
    active: true,
    sortOrder: 2,
  },
  {
    name: 'Barba',
    description: 'Perfilado, arreglo y cuidado de barba con productos profesionales.',
    price: 20000,
    durationMin: 30,
    active: true,
    sortOrder: 3,
  },
]

export interface Slot {
  time: string
  available: boolean
  blocked: boolean
}

export interface MonthDayInfo {
  open: boolean
  hasSlots: boolean
  blocked: boolean
}

export interface BookingInput {
  serviceId: string
  date: string // YYYY-MM-DD (local negocio)
  time: string // HH:mm
  name: string
  phone: string
  whatsapp: string | null
  email: string | null
  notes: string | null
}

export interface BookingResult {
  ok: boolean
  error?: string
  code?: 'slot_taken' | 'invalid' | 'closed' | 'blocked' | 'past' | 'not_found'
  appointment?: AppointmentRecord
}