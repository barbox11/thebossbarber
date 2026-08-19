export interface ValidationError {
  field: string
  message: string
}

export function sanitizeText(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export const PHONE_RE = /^\+?[0-9\s\-()]{7,18}$/
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export interface BookingDetailsForm {
  name: string
  phone: string
  notes: string
}

export function validateBookingDetails(form: BookingDetailsForm): ValidationError[] {
  const errors: ValidationError[] = []

  const name = sanitizeText(form.name)
  if (name.length < 3) {
    errors.push({ field: 'name', message: 'Ingresa tu nombre completo.' })
  }

  const phone = sanitizeText(form.phone)
  if (!PHONE_RE.test(phone)) {
    errors.push({ field: 'phone', message: 'Ingresa un teléfono válido.' })
  }

  return errors
}

export function validateLogin(email: string, password: string): ValidationError[] {
  const errors: ValidationError[] = []
  if (!EMAIL_RE.test(email.trim())) {
    errors.push({ field: 'email', message: 'Correo inválido.' })
  }
  if (password.length < 8) {
    errors.push({ field: 'password', message: 'La contraseña debe tener al menos 8 caracteres.' })
  }
  return errors
}
