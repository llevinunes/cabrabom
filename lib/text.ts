function nameParts(name: string): string[] {
  return name.trim().split(/\s+/).filter(Boolean);
}

export function initials(name: string): string {
  const parts = nameParts(name);
  if (parts.length === 0) return "";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toLocaleUpperCase("pt-BR");
}

export function firstName(name: string): string {
  return nameParts(name)[0] ?? "";
}

export function formatKm(km: number): string {
  const value = km.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${value} km`;
}

/**
 * What is shown about where a provider is: the neighborhood, or "City - UF" when the
 * geocoder only knew the city. Never more precise than that (spec section 9).
 */
export function placeLabel(place: { neighborhood: string | null; city: string | null; state: string | null }): string | null {
  if (place.neighborhood) return place.neighborhood;
  if (!place.city) return null;
  return place.state ? `${place.city} - ${place.state}` : place.city;
}
