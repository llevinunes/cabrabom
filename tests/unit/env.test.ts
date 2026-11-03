import { describe, expect, test } from "vitest";
import { parseEnv, pushEnabled } from "@/lib/env";

const valid = {
  SUPABASE_URL: "http://127.0.0.1:54321",
  SUPABASE_SERVICE_ROLE_KEY: "secret",
  WHATSAPP_CABRABOM_NUMBER: "5583900000000",
  COOKIE_SECRET: "x".repeat(32),
};

describe("parseEnv", () => {
  test("defaults APP_URL to localhost", () => {
    expect(parseEnv(valid).APP_URL).toBe("http://localhost:3000");
  });

  test("strips a trailing slash from APP_URL", () => {
    expect(parseEnv({ ...valid, APP_URL: "https://cabrabom.app/" }).APP_URL).toBe("https://cabrabom.app");
  });

  test("treats empty optional values as missing", () => {
    const env = parseEnv({ ...valid, META_APP_SECRET: "", WHATSAPP_VERIFY_TOKEN: "" });
    expect(env.META_APP_SECRET).toBeUndefined();
    expect(env.WHATSAPP_VERIFY_TOKEN).toBeUndefined();
  });

  test("names the missing variable", () => {
    expect(() => parseEnv({ ...valid, SUPABASE_SERVICE_ROLE_KEY: undefined })).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  test("requires the CabraBom number to be digits only", () => {
    expect(() => parseEnv({ ...valid, WHATSAPP_CABRABOM_NUMBER: "+55 83 9000-0000" })).toThrow(
      /WHATSAPP_CABRABOM_NUMBER/,
    );
  });
});

test("requires a cookie secret of at least 32 characters", () => {
  expect(() => parseEnv({ ...valid, COOKIE_SECRET: "short" })).toThrow(/COOKIE_SECRET/);
});

describe("push", () => {
  test("is off without the VAPID keys", () => {
    expect(pushEnabled(parseEnv(valid))).toBe(false);
  });

  test("is on with the three VAPID values", () => {
    const env = parseEnv({ ...valid, VAPID_PUBLIC_KEY: "pub", VAPID_PRIVATE_KEY: "priv", VAPID_SUBJECT: "mailto:a@b.c" });
    expect(pushEnabled(env)).toBe(true);
  });
});

describe("production", () => {
  const production = {
    ...valid,
    WHATSAPP_VERIFY_TOKEN: "verify",
    META_APP_SECRET: "meta",
    CRON_SECRET: "cron",
  };

  test("requires the webhook and cron secrets", () => {
    expect(() => parseEnv({ ...production, META_APP_SECRET: undefined }, "production")).toThrow(/META_APP_SECRET/);
    expect(() => parseEnv({ ...production, WHATSAPP_VERIFY_TOKEN: "" }, "production")).toThrow(/WHATSAPP_VERIFY_TOKEN/);
    expect(() => parseEnv({ ...production, CRON_SECRET: undefined }, "production")).toThrow(/CRON_SECRET/);
    expect(parseEnv(production, "production").CRON_SECRET).toBe("cron");
  });

  test("they stay optional in development", () => {
    expect(() => parseEnv(valid, "development")).not.toThrow();
  });
});
