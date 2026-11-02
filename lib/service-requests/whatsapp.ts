/** wa.me link with the ready-made first message of spec 3.2, including the accept link. */
export function whatsappLink(
  provider: { name: string; whatsapp: string },
  client: { name: string; category: string; details: string },
  acceptUrl: string,
): string {
  const message =
    `Olá, ${provider.name}! Encontrei você no CabraBom.\n\n` +
    `Meu nome é ${client.name} e preciso de um serviço de *${client.category}*.\n\n` +
    `Detalhes: ${client.details}\n\n` +
    `Você teria disponibilidade?\n\n` +
    `Para aceitar pelo CabraBom: ${acceptUrl}`;
  return `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(message)}`;
}
