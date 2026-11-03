// CabraBom service worker: only web push (spec 5). No offline cache.

// Take control of tabs that were already open, so a notification tap can navigate them.
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let message = {};
  try {
    message = event.data ? event.data.json() : {};
  } catch {
    // not JSON: show the generic notification below
  }
  event.waitUntil(
    self.registration.showNotification(message.title || "CabraBom", {
      body: message.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: message.url || "/" },
    }),
  );
});

/** Only pages of the app: anything else opens the home page. */
function appUrl(path) {
  const url = new URL(path || "/", self.location.origin);
  return url.origin === self.location.origin ? url.href : new URL("/", self.location.origin).href;
}

// Opens the link of the notification, reusing an open CabraBom window when it can.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = appUrl(event.notification.data && event.notification.data.url);
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => client.url.startsWith(self.location.origin));
      if (!open) return self.clients.openWindow(url);
      // navigate() rejects on a tab this worker does not control yet.
      return open
        .navigate(url)
        .then((client) => (client || open).focus())
        .catch(() => self.clients.openWindow(url));
    }),
  );
});
