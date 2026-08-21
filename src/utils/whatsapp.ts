export function toWhatsAppNumber(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits.startsWith('57') ? digits : `57${digits}`
}