import { redirect } from "next/navigation";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { getCurrentProvider } from "@/server/current-provider";
import { getCurrentSession } from "@/server/session";
import { LocationForm } from "./LocationForm";

// The provider can change where they work at any time (design doc, decision of the user).
export default async function EditLocation() {
  if (!(await getCurrentSession())) redirect("/entrar?voltar=/painel/localizacao");
  if (!(await getCurrentProvider())) redirect("/prestador");
  return (
    <main className="flex flex-col gap-6">
      <ScreenHeader title="Mudar localização" subtitle="Usamos para calcular a distância até os clientes" backHref="/painel" />
      <LocationForm />
    </main>
  );
}
