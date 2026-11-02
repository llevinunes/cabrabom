import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SimulatorForm } from "./SimulatorForm";

// Stands in for "sending the message on WhatsApp" while the Meta number is not set up.
export default async function WhatsAppSimulator({ searchParams }: PageProps<"/dev/whatsapp">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { codigo } = await searchParams;
  const code = typeof codigo === "string" ? codigo : "";

  return (
    <main className="flex flex-col gap-6">
      <ScreenHeader
        title="Simulador do WhatsApp"
        subtitle="Faz o papel da mensagem que chegaria no número do CabraBom."
      />
      <SimulatorForm initialText={code ? `ENTRAR ${code}` : "ENTRAR "} />
    </main>
  );
}
