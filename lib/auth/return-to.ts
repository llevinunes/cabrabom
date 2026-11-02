/** Where to go after login (`/entrar?voltar=...`): only paths inside the app, otherwise "/". */
export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/")) return "/";
  if (value.startsWith("//") || value.startsWith("/\\")) return "/";
  return value;
}
