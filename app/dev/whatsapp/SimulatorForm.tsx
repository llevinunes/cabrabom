"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { simulateMessage } from "./actions";

export function SimulatorForm({ initialText }: { initialText: string }) {
  const [result, action, pending] = useActionState(simulateMessage, null);
  return (
    <form action={action} className="flex flex-col gap-5">
      <Field id="from" name="from" label="Número" inputMode="tel" placeholder="83 99999-1234" required />
      <Field id="text" name="text" label="Mensagem" defaultValue={initialText} required />
      <Button type="submit" variant="whatsapp" disabled={pending}>
        Simular envio
      </Button>
      {result && (
        <p role="status" className="text-sm font-semibold">
          {result.message}
        </p>
      )}
    </form>
  );
}
