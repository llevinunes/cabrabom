import { BrandMark } from "@/components/ui/BrandMark";
import { safeReturnTo } from "@/lib/auth/return-to";
import { LoginFlow } from "./LoginFlow";

export default async function SignIn({ searchParams }: PageProps<"/entrar">) {
  const { voltar } = await searchParams;
  const returnTo = safeReturnTo(typeof voltar === "string" ? voltar : null);

  return (
    <main className="flex flex-col gap-6">
      <BrandMark />
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] leading-tight font-black">Entrar com WhatsApp</h1>
        <p className="text-secundario">
          Vamos abrir o WhatsApp com uma mensagem pronta para o CabraBom. É só tocar em enviar. Não precisa de senha.
        </p>
      </div>
      <LoginFlow returnTo={returnTo} showSimulator={process.env.NODE_ENV !== "production"} />
    </main>
  );
}
