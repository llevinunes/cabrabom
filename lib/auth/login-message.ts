const MESSAGE = /^\s*entrar\s+([a-z0-9]{5})\s*$/i;

/** Reads the code from the ready-made login message ("ENTRAR K7F2Q"). */
export function extractCode(text: string): string | null {
  const match = MESSAGE.exec(text);
  return match ? match[1].toUpperCase() : null;
}

/** wa.me link that opens a chat with the CabraBom number and the message ready to send. */
export function loginLink(cabraBomNumber: string, code: string): string {
  return `https://wa.me/${cabraBomNumber}?text=${encodeURIComponent(`ENTRAR ${code}`)}`;
}
