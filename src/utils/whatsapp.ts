export function toWhatsAppNumber(value: string): string {
  const digits = value.replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, '')
  return `57${digits}`
}