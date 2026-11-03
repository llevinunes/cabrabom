"use client";

import { useActionState } from "react";
import { LocationField } from "@/components/LocationField";
import { Button } from "@/components/ui/Button";
import { saveLocation } from "../actions";

export function LocationForm() {
  const [state, action, pending] = useActionState(saveLocation, null);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <LocationField label="Onde você atende?" hint="Só o bairro aparece para os clientes" error={state?.error} />
      <Button type="submit" variant="primary" disabled={pending}>
        Salvar localização
      </Button>
    </form>
  );
}
