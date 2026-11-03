import { describe, expect, test } from "vitest";
import { firstName, formatKm, initials, placeLabel } from "@/lib/text";

describe("initials", () => {
  test("uses the first and last names", () => {
    expect(initials("João Silva")).toBe("JS");
    expect(initials("  raimundo da costa ")).toBe("RC");
  });

  test("uses a single letter for a single name", () => {
    expect(initials("Maria")).toBe("M");
  });
});

test("firstName", () => {
  expect(firstName("Antônio Ferreira")).toBe("Antônio");
  expect(firstName("  Maria ")).toBe("Maria");
});

test("formatKm uses a comma and one decimal place", () => {
  expect(formatKm(1.2)).toBe("1,2 km");
  expect(formatKm(3)).toBe("3,0 km");
});

describe("placeLabel", () => {
  test("prefers the neighborhood", () => {
    expect(placeLabel({ neighborhood: "Centro", city: "Mulungu", state: "CE" })).toBe("Centro");
  });

  test("falls back to city and state when there is no neighborhood", () => {
    expect(placeLabel({ neighborhood: null, city: "Mulungu", state: "CE" })).toBe("Mulungu - CE");
    expect(placeLabel({ neighborhood: null, city: "Mulungu", state: null })).toBe("Mulungu");
  });

  test("is null when nothing is known", () => {
    expect(placeLabel({ neighborhood: null, city: null, state: null })).toBeNull();
  });
});
