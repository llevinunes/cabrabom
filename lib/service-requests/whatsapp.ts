// Bidirectional controls can visually reorder text; the message looks like it comes from CabraBom.
const BIDI_CONTROLS = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;

const clean = (text: string) => text.replace(BIDI_CONTROLS, "");
/** Single line: a name with line breaks could fake an extra "Para aceitar" line. */
const oneLine = (text: string) => clean(text).replace(/\s+/g, " ").trim();

/** wa.me link with the ready-made first message of spec 3.2, including the accept link. */
export function whatsappLink(
  provider: { name: string; whatsapp: string },
  client: { name: string; category: string; details: string },
  acceptUrl: string,
): string {
  const message =
    `Olá, ${provider.name}! Encontrei você no CabraBom.\n\n` +
    `Meu nome é ${oneLine(client.name)} e preciso de um serviço de *${oneLine(client.category)}*.\n\n` +
    `Detalhes: ${clean(client.details).trim()}\n\n` +
    `Você teria disponibilidade?\n\n` +
    `Para aceitar pelo CabraBom: ${acceptUrl}`;
  return `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(message)}`;
}
