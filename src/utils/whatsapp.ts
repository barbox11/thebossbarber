export const BUSINESS_WHATSAPP_NUMBER = '3217650814'

export function normalizePhoneNumber(value: string): string {
  let digits = value.replace(/\D/g, '')
  while (digits.startsWith('57') && digits.length > 10) digits = digits.slice(2)
  return digits
}

export function toWhatsAppNumber(_value: string): string {
  return `57${BUSINESS_WHATSAPP_NUMBER}`
}