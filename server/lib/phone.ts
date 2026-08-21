export function normalizePhoneNumber(value: string): string {
  let digits = value.replace(/\D/g, '')
  while (digits.startsWith('57') && digits.length > 10) digits = digits.slice(2)
  return digits
}