"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/Field";
import { startLogin, type StartLoginResult } from "./actions";

const POLL_MS = 2000;

export function LoginFlow({ returnTo, showSimulator }: { returnTo: string; showSimulator: boolean }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<StartLoginResult | null>(null);
  const [expired, setExpired] = useState(false);
  const waiting = result?.ok === true && !expired;

  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(async () => {
      const response = await fetch("/api/entrar/status", { cache: "no-store" });
      const status: { ready: boolean; expired?: boolean } = await response.json();
      if (status.ready) {
        clearInterval(timer);
        window.location.assign(returnTo);
      } else if (status.expired) {
        clearInterval(timer);
        setExpired(true);
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [waiting, returnTo]);

  function begin() {
    startTransition(async () => {
      const started = await startLogin();
      setExpired(false);
      setResult(started);
      if (started.ok) window.open(started.link, "_blank", "noopener");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Button type="button" variant="whatsapp" onClick={begin} disabled={pending}>
        {result?.ok ? "Abrir o WhatsApp de novo" : "Entrar com WhatsApp"}
      </Button>

      {result?.ok === false && <FieldError>{result.error}</FieldError>}

      {waiting && (
        <div role="status" className="flex flex-col gap-2 rounded-card border border-borda bg-superficie p-4">
          <p className="font-bold">Aguardando sua mensagem…</p>
          <p className="text-sm text-secundario">
            Se o WhatsApp não abriu, envie <strong className="text-obra">ENTRAR {result.code}</strong> para o número{" "}
            <strong className="text-obra">+{result.cabraBomNumber}</strong>.
          </p>
          {showSimulator && (
            <a
              href={`/dev/whatsapp?codigo=${result.code}`}
              target="_blank"
              className="text-sm font-semibold text-laranja-texto underline"
            >
              Simular mensagem
            </a>
          )}
        </div>
      )}

      {expired && <FieldError>O código expirou. Toque no botão para gerar outro.</FieldError>}
    </div>
  );
}
