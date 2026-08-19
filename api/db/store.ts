import type {
  AppointmentRecord,
  AppointmentStatus,
  BlockedTimeRecord,
  BookingInput,
  BookingResult,
  BusinessHourRecord,
  BusinessSettings,
  ServiceRecord,
} from './types'

export interface AdminRecord {
  id: string
  email: string
  name: string
  passwordHash: string
  role: 'ADMIN'
}

export interface ServiceInput {
  name: string
  description?: string | null
  price: number
  durationMin: number
  active: boolean
  sortOrder: number
}

export interface HourInput {
  dayOfWeek: number
  openTime: string
  closeTime: string
  isOpen: boolean
}

export interface BlockedInput {
  date: string // YYYY-MM-DD
  startTime?: string
  endTime?: string
  reason?: string | null
  allDay?: boolean
}

export interface Store {
  mode: 'postgres' | 'memory'
  init(): Promise<void>
  listServices(includeInactive: boolean): Promise<ServiceRecord[]>
  createService(input: ServiceInput): Promise<ServiceRecord>
  updateService(id: string, input: Partial<ServiceInput>): Promise<ServiceRecord | null>
  getHours(): Promise<BusinessHourRecord[]>
  upsertHours(input: HourInput[]): Promise<BusinessHourRecord[]>
  getBlocked(): Promise<BlockedTimeRecord[]>
  createBlocked(input: BlockedInput): Promise<BlockedTimeRecord>
  deleteBlocked(id: string): Promise<boolean>
  getSettings(): Promise<BusinessSettings>
  updateSettings(patch: Partial<BusinessSettings>): Promise<BusinessSettings>
  findAdminByEmail(email: string): Promise<AdminRecord | null>
  listAppointments(): Promise<Array<import('./types').AppointmentWithRelations>>
  updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<AppointmentRecord | null>
  createBooking(input: BookingInput): Promise<BookingResult>
  listCustomers(): Promise<
    Array<import('./types').CustomerRecord & { bookingsCount: number; totalSpent: number; lastBookingAt: Date | null }>
  >
}