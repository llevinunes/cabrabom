/** A resolved place. Only neighborhood and rounded distance are ever shown (spec section 9). */
export type Place = { lat: number; lng: number; neighborhood: string | null; city: string | null };

/** What a form sends: the browser's GPS position or a CEP typed by the person. */
export type LocationInput = { kind: "gps"; lat: number; lng: number } | { kind: "cep"; cep: string };

export const USER_AGENT = "CabraBom (+https://github.com/llevinunes/cabrabom)";
