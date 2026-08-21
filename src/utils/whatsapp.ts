export function toWhatsAppNumber(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits.replace(/^57(?=3\d{9}$)/, '')
}