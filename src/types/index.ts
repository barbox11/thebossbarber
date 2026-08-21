export type AppointmentStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export interface Service {
  id: string
  name: string
  description: string | null
  price: number
  durationMin: number
  active: boolean
  sortOrder: number
}

export interface Customer {
  id: string
  name: string
  phone: string
  whatsapp: string | null
  email: string | null
  notes: string | null
  createdAt: string
}

export interface Appointment {
  id: string
  serviceId: string
  customerId: string
  slotStart: string
  slotEnd: string
  status: AppointmentStatus
  priceAtBooking: number
  durationAtBooking: number
  nameSnapshot: string
  phoneSnapshot: string
  whatsappSnapshot: string | null
  emailSnapshot: string | null
  notes: string | null
  createdAt: string
  time: string
  date: string
  service?: Service
  customer?: Customer
}

export interface CustomerWithStats extends Customer {
  bookingsCount: number
  totalSpent: number
  lastBookingAt: string | null
  canDelete: boolean
}

export interface CreateBlockedTimeInput {
  date: string
  startTime?: string
  endTime?: string
  reason?: string | null
  allDay?: boolean
}

export interface DaySlot {
  time: string // "HH:mm"
  available: boolean
  blocked: boolean
}

export interface AvailabilityResponse {
  date: string // YYYY-MM-DD
  slots: DaySlot[]
  isOpen: boolean
}

export interface BusinessHour {
  id: string
  dayOfWeek: number // 0=Dom ... 6=Sáb
  openTime: string
  closeTime: string
  isOpen: boolean
}

export interface BlockedTime {
  id: string
  date: string // YYYY-MM-DD
  startTime: string
  endTime: string
  reason: string | null
  allDay: boolean
}

export interface BusinessSettings {
  businessName: string
  barberName: string
  phone: string
  whatsapp: string
  address: string
  instagram: string
  statsCustomers: string
  statsYears: string
  statsRating: string
}

export interface BookingDetails {
  name: string
  phone: string
  whatsapp: string | null
  email: string | null
  notes: string | null
}

export interface CreateBookingInput extends BookingDetails {
  serviceId: string
  date: string // YYYY-MM-DD
  time: string // "HH:mm"
}

export interface CreateBookingResult {
  ok: boolean
  error?: string
  errorCode?: string
  appointment?: Appointment
}

export interface AuthResponse {
  token: string
  user: { id: string; name: string; email: string; role: string }
}

export interface TodayAppointment {
  id: string
  name: string
  service: string
  time: string
  status: AppointmentStatus
  price: number
  phone: string
  slotStart: string
}

export interface DashboardSummary {
  todayBookings: number
  monthBookings: number
  monthRevenue: number
  customers: number
  completed: number
  cancelled: number
  occupancyRate: number
  todayAppointments: TodayAppointment[]
  bookingsByDay: { label: string; value: number }[]
  revenueByDay: { label: string; value: number }[]
  servicesByBookings: { label: string; value: number }[]
  busyHours: { label: string; value: number }[]
}

export type BookingStep = 'service' | 'date' | 'time' | 'details' | 'confirm'
