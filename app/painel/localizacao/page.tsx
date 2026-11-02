import { redirect } from "next/navigation";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { getCurrentProvider } from "@/server/current-provider";
import { LocationForm } from "./LocationForm";

// The provider can change where they work at any time (design doc, decision of the user).
export default async function EditLocation() {
  if (!(await getCurrentProvider())) redirect("/entrar?voltar=/painel/localizacao");
  return (
    <main className="flex flex-col gap-6">
      <ScreenHeader title="Mudar localização" subtitle="Usamos para calcular a distância até os clientes" backHref="/painel" />
      <LocationForm />
    </main>
  );
}
