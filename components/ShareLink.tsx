"use client";

import { useState } from "react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * Screen 09: a link the user sends on their own WhatsApp. The share button is a real
 * wa.me link (works without JavaScript); where the Web Share API exists, it opens the
 * system share sheet instead.
 */
export function ShareLink({ url, shareLabel, text }: { url: string; shareLabel: React.ReactNode; text: string }) {
  const [copied, setCopied] = useState<boolean | null>(null);

  function share(event: React.MouseEvent) {
    if (typeof navigator.share !== "function") return;
    event.preventDefault();
    navigator.share({ text, url }).catch(() => {
      // cancelled by the user, or not allowed: nothing to do
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-campo border-[1.5px] border-dashed border-borda bg-superficie px-4 py-3 font-bold [overflow-wrap:anywhere]">
        {url}
      </p>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
        target="_blank"
        rel="noopener"
        onClick={share}
        // The label may carry a client name: let it wrap instead of widening the page.
        className={`${buttonClasses("whatsapp")} min-w-0 text-center [overflow-wrap:anywhere]`}
      >
        <Icon name="chat" className="size-5" />
        {shareLabel}
      </a>
      <Button type="button" variant="outline" onClick={copy}>
        Copiar link
      </Button>
      <p role="status" className={`text-center text-sm font-semibold ${copied === false ? "text-secundario" : "text-livre-texto"}`}>
        {copied === true && "Link copiado"}
        {copied === false && "Não foi possível copiar. Segure o link acima para copiar."}
      </p>
    </div>
  );
}
