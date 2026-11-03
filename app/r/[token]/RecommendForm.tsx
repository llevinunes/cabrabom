"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { ChipOption } from "@/components/ui/ChipOption";
import { Field, FieldError } from "@/components/ui/Field";
import { COMMENT_MAX_LENGTH, HIGHLIGHTS } from "@/lib/recommendations/highlights";
import { recommend } from "./actions";

export function RecommendForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(recommend, null);
  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">O que se destacou?</legend>
        <div className="flex flex-wrap gap-2">
          {HIGHLIGHTS.map((highlight) => (
            <ChipOption key={highlight} type="checkbox" name="highlight" value={highlight}>
              {highlight}
            </ChipOption>
          ))}
        </div>
      </fieldset>
      <Field
        id="comment"
        name="comment"
        label="Comentário (opcional)"
        placeholder="Conte como foi o serviço..."
        multiline
        rows={3}
        maxLength={COMMENT_MAX_LENGTH}
      />
      {state?.error && <FieldError>{state.error}</FieldError>}
      <Button type="submit" disabled={pending}>
        Enviar recomendação
      </Button>
      <p className="text-[13px] text-secundario">
        Sua recomendação aparece no perfil com seu primeiro nome. Seu número nunca é exibido.
      </p>
    </form>
  );
}
