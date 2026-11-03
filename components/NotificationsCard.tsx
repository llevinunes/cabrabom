"use client";

import { useEffect, useState } from "react";
import { Button, buttonClasses } from "@/components/ui/Button";

type Mode = "hidden" | "install" | "login" | "offer" | "done" | "failed";

const isIPhone = () => /iPhone|iPad|iPod/.test(navigator.userAgent);
const isInstalled = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;
const supportsPush = () => "serviceWorker" in navigator && "PushManager" in window;

/** The VAPID public key, URL-safe base64, as the bytes pushManager.subscribe expects. */
function keyBytes(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

/**
 * "Ativar notificações" (screen 05 and panel). On iPhone, push only works once the app
 * is on the home screen (spec 5), and there the login must be done again (ADR 0039).
 */
export function NotificationsCard({
  publicKey,
  loggedIn,
  returnTo,
  title,
  text,
}: {
  publicKey: string | null;
  loggedIn: boolean;
  returnTo: string;
  title: string;
  text: string;
}) {
  const [mode, setMode] = useState<Mode>("hidden");

  useEffect(() => {
    if (!publicKey) return;
    let cancelled = false;
    async function decide(): Promise<Mode> {
      if (!supportsPush()) return isIPhone() && !isInstalled() ? "install" : "hidden";
      if (!loggedIn) return "login";
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager?.getSubscription();
      return subscription && Notification.permission === "granted" ? "hidden" : "offer";
    }
    decide().then((next) => {
      if (!cancelled) setMode(next);
    });
    return () => {
      cancelled = true;
    };
  }, [publicKey, loggedIn]);

  async function enable() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      if ((await Notification.requestPermission()) !== "granted") return setMode("failed");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBytes(publicKey!),
      });
      const response = await fetch("/api/push/inscrever", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      setMode(response.ok ? "done" : "failed");
    } catch {
      setMode("failed");
    }
  }

  if (mode === "hidden") return null;
  return (
    <section className="flex flex-col gap-3 rounded-card bg-obra p-4 text-white">
      <h2 className="text-lg leading-tight font-extrabold">{title}</h2>
      {mode === "install" ? (
        <p className="text-sm">
          No iPhone, toque em Compartilhar e depois em &quot;Adicionar à Tela de Início&quot;. Abra o CabraBom pela tela
          inicial para ativar as notificações.
        </p>
      ) : (
        <p className="text-sm">{text}</p>
      )}
      {mode === "login" && (
        <a href={`/entrar?voltar=${encodeURIComponent(returnTo)}`} className={buttonClasses("primary")}>
          Entrar para ativar
        </a>
      )}
      {(mode === "offer" || mode === "failed") && (
        <Button type="button" onClick={enable}>
          Ativar notificações
        </Button>
      )}
      <p role="status" className="text-sm font-semibold">
        {mode === "done" && "Notificações ativadas."}
        {mode === "failed" && "Não foi possível ativar. Confira a permissão do navegador."}
      </p>
    </section>
  );
}
