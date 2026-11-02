"use client";

import { useActionState } from "react";
import { startChat } from "@/app/p/chat-actions";
import { Button } from "@/components/ui/Button";
import { ChipOption } from "@/components/ui/ChipOption";
import { Field, FieldError } from "@/components/ui/Field";
import type { Category } from "@/lib/categories";

export function ChatForm({
  providerId,
  providerFirstName,
  categories,
  defaults,
}: {
  providerId: string;
  providerFirstName: string;
  categories: Category[];
  defaults: { name: string; category: string; details: string };
}) {
  const [state, action, pending] = useActionState(startChat, null);
  const errors = state?.errors ?? {};
  // React resets uncontrolled fields after an action: refill with what was sent.
  const values = state?.values ?? defaults;
  const onlyOne = categories.length === 1;

  return (
    <form key={JSON.stringify(values)} action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="provider_id" value={providerId} />
      <Field id="name" name="name" label="Seu nome" placeholder="Ex.: Maria" defaultValue={values.name} error={errors.name} />

      <fieldset className="flex flex-col gap-2" aria-describedby={errors.category ? "category-error" : undefined}>
        <legend className="mb-2 text-sm font-semibold">Categoria</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <ChipOption
              key={category.id}
              type="radio"
              name="category"
              value={category.slug}
              defaultChecked={onlyOne || values.category === category.slug}
            >
              {category.name}
            </ChipOption>
          ))}
        </div>
        {errors.category && <FieldError id="category-error">{errors.category}</FieldError>}
      </fieldset>

      <Field
        id="details"
        name="details"
        label="Detalhes do serviço"
        multiline
        rows={3}
        maxLength={500}
        placeholder="Descreva o que precisa ser feito."
        defaultValue={values.details}
        error={errors.details}
      />

      {errors.form && <FieldError>{errors.form}</FieldError>}

      <Button type="submit" variant="whatsapp" disabled={pending}>
        Conversar no WhatsApp
      </Button>
      <p className="text-[13px] text-secundario">
        Vamos abrir o WhatsApp com uma mensagem pronta para {providerFirstName}.
      </p>
    </form>
  );
}
