/** "00000-000": 8 digits and the hyphen. */
export const CEP_MAX_LENGTH = 9;

/** Mask applied while typing: keeps up to 8 digits and adds the hyphen after the fifth. */
export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/^(\d{5})(\d{1,3})$/, "$1-$2");
}
