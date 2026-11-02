/** Where to go after login (`/entrar?voltar=...`): only paths inside the app, otherwise "/". */
export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  // Browsers drop tabs/newlines and treat "\\" as "/" while parsing, so "/\t/evil.com"
  // or "/\\evil.com" would leave the app. Reject them anywhere in the value.
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return "/";
  return value;
}
