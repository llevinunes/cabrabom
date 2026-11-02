const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Ids come from cookies and URLs; checking the shape avoids a database error on garbage. */
export function isUuid(value: string): boolean {
  return UUID.test(value);
}
