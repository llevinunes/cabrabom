import { redirect } from "next/navigation";
import { firstName } from "@/lib/text";
import { getCurrentProvider } from "@/server/current-provider";
import { getCurrentSession } from "@/server/session";

// Screen 10 · provider panel. Minimal for now; status, requests and location come in PR 8.
export default async function ProviderPanel() {
  // proxy.ts only checks that a cookie exists; the session itself may be gone.
  if (!(await getCurrentSession())) redirect("/entrar?voltar=/painel");
  const provider = await getCurrentProvider();
  if (!provider) redirect("/prestador");

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-[28px] font-black">Olá, {firstName(provider.name)}</h1>
    </main>
  );
}
