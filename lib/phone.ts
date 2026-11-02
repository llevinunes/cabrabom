/**
 * Normalizes a Brazilian phone number to 55 + area code + number, digits only
 * (e.g. "5583999991234"). Returns null when it is not a Brazilian number.
 *
 * WhatsApp ids for some Brazilian mobiles arrive without the leading 9
 * ("558399991234"); those get the 9 back so they match what people type.
 */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  if (!digits.startsWith("55")) return null;

  if (digits.length === 12) {
    const firstDigit = digits[4];
    // 8-digit numbers starting with 6–9 are mobiles missing the 9; 2–5 are landlines.
    return /[6-9]/.test(firstDigit) ? `${digits.slice(0, 4)}9${digits.slice(4)}` : digits;
  }
  return digits.length === 13 && digits[4] === "9" ? digits : null;
}
