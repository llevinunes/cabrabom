"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FieldError } from "@/components/ui/Field";
import { REPORT_MAX_LENGTH } from "@/lib/reports/create";
import { sendReport } from "./actions";

export function ReportForm({ providerId, requestToken }: { providerId?: string; requestToken?: string }) {
  const [state, action, pending] = useActionState(sendReport, null);
  if (state && "sent" in state) {
    return (
      <p role="status" className="rounded-card bg-livre-fundo p-4 font-semibold text-livre-texto">
        Recebemos seu relato. Obrigado por avisar.
      </p>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-4">
      {providerId && <input type="hidden" name="provider" value={providerId} />}
      {requestToken && <input type="hidden" name="request" value={requestToken} />}
      <Field
        id="description"
        name="description"
        label="O que aconteceu?"
        multiline
        rows={5}
        required
        maxLength={REPORT_MAX_LENGTH}
      />
      {state && "error" in state && <FieldError>{state.error}</FieldError>}
      <Button type="submit" disabled={pending}>
        Enviar
      </Button>
    </form>
  );
}
