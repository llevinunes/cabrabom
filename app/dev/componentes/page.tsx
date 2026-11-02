import { notFound } from "next/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { ProviderCard } from "@/components/ui/ProviderCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

// Showcase of the design guide components. Only available outside production.
export default function ComponentsShowcase() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="flex flex-col gap-6">
      <BrandMark />
      <ScreenHeader title="Componentes" subtitle="Vitrine do guia de design" backHref="/" />
      <div className="flex gap-3">
        <Icon name="chat" />
        <Icon name="location" />
        <Icon name="back" />
        <Icon name="check" />
        <Icon name="profile" />
      </div>
      <div className="flex flex-col gap-3">
        <Button type="button" variant="primary">Botão</Button>
        <Button type="button" variant="secondary">Botão</Button>
        <Button type="button" variant="whatsapp">Botão</Button>
        <Button type="button" variant="outline">Botão</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip>Chip</Chip>
        <Chip variant="selected">Chip</Chip>
        <Chip variant="free">Chip</Chip>
        <Chip variant="busy">Chip</Chip>
      </div>
      <Field id="label" label="Rótulo" placeholder="Valor" />
      <Field id="error" label="Com erro" placeholder="Valor" error="Informe seu nome" />
      <ProviderCard
        provider={{
          name: "Nome do prestador",
          neighborhood: "Bairro",
          distanceKm: 0,
          busy: false,
          categories: ["Categoria 1", "Categoria 2"],
          recommendationCount: 3,
        }}
        chatAction={<Button type="button" variant="whatsapp">Conversar no WhatsApp</Button>}
      />
    </main>
  );
}
