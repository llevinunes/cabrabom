"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import type { LoginStatus } from "../api/entrar/status/route";
import { startLogin, type StartLoginResult } from "./actions";

const POLL_MS = 2000;

export function LoginFlow({ returnTo, showSimulator }: { returnTo: string; showSimulator: boolean }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<StartLoginResult | null>(null);
  const [expired, setExpired] = useState(false);
  const waiting = result?.ok === true && !expired;

  useEffect(() => {
    if (!waiting) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    // One request at a time: the next check starts only after the previous one answered.
    async function check() {
      try {
        const response = await fetch("/api/entrar/status", { cache: "no-store" });
        const status: LoginStatus = await response.json();
        if (status.ready) return window.location.assign(returnTo);
        if (status.expired) return setExpired(true);
      } catch {
        // offline or a server hiccup: just try again
      }
      if (!stopped) timer = setTimeout(check, POLL_MS);
    }
    timer = setTimeout(check, POLL_MS);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [waiting, returnTo]);

  function begin() {
    startTransition(async () => {
      setExpired(false);
      setResult(await startLogin());
    });
  }

  if (!waiting) {
    return (
      <div className="flex flex-col gap-4">
        <Button type="button" variant="whatsapp" onClick={begin} disabled={pending}>
          {expired ? "Gerar outro código" : "Entrar com WhatsApp"}
        </Button>
        {expired && <FieldError>O código expirou. Gere outro para continuar.</FieldError>}
        {result?.ok === false && <FieldError>{result.error}</FieldError>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* A real link, opened by the user's own tap: pop-ups after async work are blocked on mobile. */}
      <a href={result.link} target="_blank" rel="noopener" className={buttonClasses("whatsapp")}>
        <Icon name="chat" className="size-5" />
        Abrir o WhatsApp
      </a>
      <div role="status" className="flex flex-col gap-2 rounded-card border border-borda bg-superficie p-4">
        <p className="font-bold">Aguardando sua mensagem…</p>
        <p className="text-sm text-secundario">
          Envie <strong className="text-obra">ENTRAR {result.code}</strong> para o número{" "}
          <strong className="text-obra">+{result.cabraBomNumber}</strong>. Esta página continua sozinha quando a
          mensagem chegar.
        </p>
        <p className="text-sm font-semibold text-ocupado-texto">
          Só envie a mensagem se foi você que pediu para entrar no CabraBom.
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
    </div>
  );
}
