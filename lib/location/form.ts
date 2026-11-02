import type { LocationInput } from "./types";

/** Reads the hidden fields written by <LocationField> (location_kind, _lat, _lng, _cep). */
export function readLocationInput(form: FormData): LocationInput | null {
  const kind = form.get("location_kind");
  if (kind === "cep") {
    const cep = String(form.get("location_cep") ?? "").trim();
    return cep ? { kind: "cep", cep } : null;
  }
  if (kind === "gps") {
    const lat = toNumber(form.get("location_lat"));
    const lng = toNumber(form.get("location_lng"));
    const valid = Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
    return valid ? { kind: "gps", lat, lng } : null;
  }
  return null;
}

function toNumber(value: FormDataEntryValue | null): number {
  return typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
}
