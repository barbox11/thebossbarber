import type {
  Appointment,
  AuthResponse,
  AvailabilityResponse,
  BlockedTime,
  BusinessHour,
  BusinessSettings,
  CreateBlockedTimeInput,
  CreateBookingInput,
  CreateBookingResult,
  CustomerWithStats,
  DashboardSummary,
  Service,
} from '@/types'

const API_BASE = '/api'

interface ApiError extends Error {
  status: number
  code?: string
}

export class ApiErrorImpl extends Error implements ApiError {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = 'Ocurrió un error inesperado.'
    let code: string | undefined
    try {
      const body = await res.json()
      message = body.error ?? message
      code = body.code
    } catch {
      /* cuerpo no JSON */
    }
    throw new ApiErrorImpl(message, res.status, code)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

function getToken(): string | null {
  return localStorage.getItem('tbb_token')
}

export interface MonthAvailability {
  month: string
  days: Record<string, { open: boolean; hasSlots: boolean; blocked: boolean }>
}

export const publicApi = {
  getServices(): Promise<Service[]> {
    return request('/services')
  },
  getAvailability(date: string, serviceId?: string): Promise<AvailabilityResponse> {
    const q = new URLSearchParams({ date })
    if (serviceId) q.set('serviceId', serviceId)
    return request(`/availability?${q.toString()}`)
  },
  getMonthAvailability(month: string, serviceId?: string): Promise<MonthAvailability> {
    const q = new URLSearchParams({ month })
    if (serviceId) q.set('serviceId', serviceId)
    return request(`/availability/month?${q.toString()}`)
  },
  getHours(): Promise<BusinessHour[]> {
    return request('/hours')
  },
  getSettings(): Promise<BusinessSettings> {
    return request('/settings/public')
  },
  createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
    return request('/bookings', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },
  cancelBooking(reference: string): Promise<{ ok: boolean }> {
    return request('/bookings/cancel', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    })
  },
}

export const adminApi = {
  login(email: string, password: string): Promise<AuthResponse> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
  me(): Promise<{ user: { id: string; name: string; email: string; role: string } }> {
    return request('/auth/me')
  },
  dashboard(): Promise<DashboardSummary> {
    return request('/admin/dashboard')
  },
  listAppointments(): Promise<Appointment[]> {
    return request('/admin/appointments')
  },
  updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
    return request(`/admin/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
  getHours(): Promise<BusinessHour[]> {
    return request('/admin/hours')
  },
  updateHours(hours: BusinessHour[]): Promise<BusinessHour[]> {
    return request('/admin/hours', {
      method: 'PUT',
      body: JSON.stringify({ hours }),
    })
  },
  getBlockedTimes(): Promise<BlockedTime[]> {
    return request('/admin/blocked')
  },
  createBlockedTime(input: CreateBlockedTimeInput): Promise<BlockedTime> {
    return request('/admin/blocked', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },
  deleteBlockedTime(id: string): Promise<{ ok: boolean }> {
    return request(`/admin/blocked/${id}`, { method: 'DELETE' })
  },
  listServices(): Promise<Service[]> {
    return request('/admin/services')
  },
  createService(input: Omit<Service, 'id'>): Promise<Service> {
    return request('/admin/services', { method: 'POST', body: JSON.stringify(input) })
  },
  updateService(id: string, input: Partial<Service>): Promise<Service> {
    return request(`/admin/services/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
  },
  listCustomers(): Promise<CustomerWithStats[]> {
    return request('/admin/customers')
  },
  getSettings(): Promise<BusinessSettings> {
    return request('/admin/settings')
  },
  updateSettings(input: Partial<BusinessSettings>): Promise<BusinessSettings> {
    return request('/admin/settings', { method: 'PUT', body: JSON.stringify(input) })
  },
}
