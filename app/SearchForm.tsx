"use client";

import { useActionState } from "react";
import { LocationField } from "@/components/LocationField";
import { RadiusControl } from "@/components/RadiusControl";
import { Button } from "@/components/ui/Button";
import { ChipOption } from "@/components/ui/ChipOption";
import { Field, FieldError } from "@/components/ui/Field";
import type { Category } from "@/lib/categories";
import { normalizeRadius, type SearchDefaults } from "@/lib/search/params";
import { search } from "./search-actions";

export function SearchForm({ categories, defaults }: { categories: Category[]; defaults: SearchDefaults }) {
  const [state, action, pending] = useActionState(search, null);
  const errors = state?.errors ?? {};
  // After a submit, show what was sent; before that, what came in the URL (e.g. "Voltar").
  const values = state?.values ?? {
    name: defaults.name,
    category: defaults.category,
    details: defaults.details,
    radius: String(defaults.radiusKm),
    cep: "",
  };

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Field
        id="name"
        name="name"
        label="Seu nome"
        placeholder="Ex.: Maria"
        autoComplete="given-name"
        defaultValue={values.name}
        error={errors.name}
      />

      <fieldset className="flex flex-col gap-2" aria-describedby={errors.category ? "category-error" : undefined}>
        <legend className="mb-2 text-sm font-semibold">Categoria</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <ChipOption
              key={category.id}
              type="radio"
              name="category"
              value={category.slug}
              defaultChecked={values.category === category.slug}
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
        placeholder="Descreva o que precisa ser feito. Ex.: trocar a fiação da cozinha e instalar 3 tomadas."
        defaultValue={values.details}
        error={errors.details}
      />

      <LocationField
        label="Onde é o serviço?"
        error={errors.location}
        defaultCep={values.cep || undefined}
        defaultPosition={state ? null : defaults.position}
      />

      <RadiusControl defaultValue={normalizeRadius(values.radius)} />

      <Button type="submit" variant="primary" disabled={pending}>
        Buscar prestadores
      </Button>
    </form>
  );
}
