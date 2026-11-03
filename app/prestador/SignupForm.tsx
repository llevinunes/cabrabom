"use client";

import { useActionState } from "react";
import { LocationField } from "@/components/LocationField";
import { Button } from "@/components/ui/Button";
import { ChipOption } from "@/components/ui/ChipOption";
import { Field, FieldError } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import type { Category } from "@/lib/categories";
import { submitSignup } from "./actions";

export function SignupForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(submitSignup, null);
  const errors = state?.errors ?? {};
  const values = state?.values;

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Field
        id="name"
        name="name"
        label="Seu nome"
        placeholder="Como os clientes vão te chamar"
        autoComplete="name"
        defaultValue={values?.name}
        error={errors.name}
      />

      <fieldset className="flex flex-col gap-2" aria-describedby={errors.categoryIds ? "category-error" : undefined}>
        <legend className="mb-2 text-sm font-semibold">Com o que você trabalha?</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <ChipOption
              key={category.id}
              type="checkbox"
              name="category"
              value={String(category.id)}
              defaultChecked={values?.categoryIds.includes(category.id)}
            >
              {category.name}
            </ChipOption>
          ))}
        </div>
        {errors.categoryIds && <FieldError id="category-error">{errors.categoryIds}</FieldError>}
      </fieldset>

      <LocationField
        label="Onde você atende?"
        hint="Só o bairro aparece para os clientes"
        error={errors.location}
        defaultCep={values?.cep || undefined}
      />

      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="consent" defaultChecked={values?.consent} className="peer sr-only" />
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-[1.5px] border-borda bg-superficie text-transparent peer-checked:border-capacete peer-checked:bg-capacete peer-checked:text-obra peer-focus-visible:outline-2 peer-focus-visible:outline-obra"
          >
            <Icon name="check" className="size-4" />
          </span>
          <span className="text-[15px]">
            Aceito que meu WhatsApp apareça para clientes que me encontrarem no CabraBom.
          </span>
        </label>
        {errors.consent && <FieldError>{errors.consent}</FieldError>}
      </div>

      <Button type="submit" variant="whatsapp" disabled={pending}>
        Continuar com WhatsApp
      </Button>
      <p className="text-[13px] text-secundario">
        Você confirma seu número enviando uma mensagem pronta. Sem senha.
      </p>
    </form>
  );
}
