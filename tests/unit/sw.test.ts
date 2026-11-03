import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, test, vi } from "vitest";

const source = readFileSync("public/sw.js", "utf8");
const ORIGIN = "https://cabrabom.app";

/** Loads public/sw.js with a fake service worker global and returns its listeners. */
function loadWorker(windows: { url: string; navigate: () => Promise<unknown>; focus: () => Promise<unknown> }[]) {
  const listeners: Record<string, (event: unknown) => void> = {};
  const clients = {
    claim: vi.fn().mockResolvedValue(undefined),
    matchAll: vi.fn().mockResolvedValue(windows),
    openWindow: vi.fn().mockResolvedValue(undefined),
  };
  const self = {
    location: { origin: ORIGIN },
    clients,
    registration: { showNotification: vi.fn() },
    addEventListener: (type: string, listener: (event: unknown) => void) => (listeners[type] = listener),
  };
  runInNewContext(source, { self, URL });
  return { listeners, clients };
}

async function click(listeners: Record<string, (event: unknown) => void>, url: string) {
  let done: Promise<unknown> = Promise.resolve();
  listeners.notificationclick({
    notification: { close: vi.fn(), data: { url } },
    waitUntil: (promise: Promise<unknown>) => (done = promise),
  });
  await done;
}

test("takes control of open tabs when it activates", async () => {
  const { listeners, clients } = loadWorker([]);
  let done: Promise<unknown> = Promise.resolve();
  listeners.activate({ waitUntil: (promise: Promise<unknown>) => (done = promise) });
  await done;
  expect(clients.claim).toHaveBeenCalled();
});

test("a tab that cannot be navigated (not controlled yet) falls back to a new window", async () => {
  const tab = { url: `${ORIGIN}/painel`, navigate: vi.fn().mockRejectedValue(new TypeError("not controlled")), focus: vi.fn() };
  const { listeners, clients } = loadWorker([tab]);
  await click(listeners, "/s/abc");
  expect(clients.openWindow).toHaveBeenCalledWith(`${ORIGIN}/s/abc`);
});

test("never opens another site", async () => {
  const { listeners, clients } = loadWorker([]);
  await click(listeners, "//evil.example/phish");
  expect(clients.openWindow).toHaveBeenCalledWith(`${ORIGIN}/`);
});
