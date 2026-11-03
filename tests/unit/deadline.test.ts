import { describe, expect, test } from "vitest";
import { confirmedText, deadlineText, isExpired, receivedText } from "@/lib/service-requests/deadline";

const created = new Date("2026-11-01T12:00:00Z");
const at = (iso: string) => new Date(iso);

describe("deadlineText", () => {
  test("counts down the 2 days of an open request", () => {
    expect(deadlineText(created, created)).toBe("expira em 2 dias");
    // a few seconds or hours after arriving it still reads as 2 days, not 1
    expect(deadlineText(created, at("2026-11-01T12:00:05Z"))).toBe("expira em 2 dias");
    expect(deadlineText(created, at("2026-11-01T13:00:00Z"))).toBe("expira em 2 dias");
    expect(deadlineText(created, at("2026-11-02T06:00:00Z"))).toBe("expira em 1 dia");
    expect(deadlineText(created, at("2026-11-02T13:00:00Z"))).toBe("expira em 23 h");
    expect(deadlineText(created, at("2026-11-03T11:30:00Z"))).toBe("expira em menos de 1 h");
    expect(deadlineText(created, at("2026-11-03T12:00:01Z"))).toBe("expirada");
  });
});

describe("isExpired", () => {
  test("by status or by the clock (the cron runs only hourly)", () => {
    expect(isExpired({ status: "expired", createdAt: created }, created)).toBe(true);
    expect(isExpired({ status: "open", createdAt: created }, at("2026-11-03T12:00:01Z"))).toBe(true);
    expect(isExpired({ status: "open", createdAt: created }, at("2026-11-03T11:59:59Z"))).toBe(false);
    expect(isExpired({ status: "accepted", createdAt: created }, at("2026-11-09T00:00:00Z"))).toBe(false);
  });
});

test("receivedText says how long ago the request arrived", () => {
  expect(receivedText(created, at("2026-11-01T12:00:30Z"))).toBe("Recebida agora");
  expect(receivedText(created, at("2026-11-01T12:05:00Z"))).toBe("Recebida há 5 min");
  expect(receivedText(created, at("2026-11-01T15:00:00Z"))).toBe("Recebida há 3 h");
  expect(receivedText(created, at("2026-11-03T12:00:00Z"))).toBe("Recebida há 2 dias");
  expect(receivedText(created, at("2026-11-02T12:00:00Z"))).toBe("Recebida há 1 dia");
});

describe("confirmedText", () => {
  // Calendar days in Brazil (UTC-3): 02:00Z on the 2nd is still the evening of the 1st.
  const confirmed = at("2026-11-01T20:00:00Z");
  test("today, yesterday and N days ago, by the local calendar", () => {
    expect(confirmedText(confirmed, at("2026-11-02T02:00:00Z"))).toBe("confirmado hoje");
    expect(confirmedText(confirmed, at("2026-11-02T12:00:00Z"))).toBe("confirmado ontem");
    expect(confirmedText(confirmed, at("2026-11-04T12:00:00Z"))).toBe("confirmado há 3 dias");
  });
});
