import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { publicProfile } from "@/lib/providers/profile";
import { createServerClient } from "@/lib/supabase/server";
import { firstName } from "@/lib/text";
import { ChatForm } from "./ChatForm";

const text = (value: string | string[] | undefined) => (typeof value === "string" ? value.slice(0, 500) : "");

// Reached from a shared profile link (no search yet): asks for name, one of the
// provider's categories and details before opening WhatsApp.
export default async function StartChat({ params, searchParams }: PageProps<"/p/[id]/conversar">) {
  const [{ id }, raw] = await Promise.all([params, searchParams]);
  const profile = await publicProfile(createServerClient(), id);
  if (!profile) notFound();
  const name = firstName(profile.name);

  return (
    <main className="flex flex-col gap-5">
      <ScreenHeader title={`Conversar com ${name}`} subtitle="Conte do que você precisa" backHref={`/p/${profile.id}`} />
      <ChatForm
        providerId={profile.id}
        providerFirstName={name}
        categories={profile.categories}
        defaults={{ name: text(raw.nome).slice(0, 60), category: text(raw.categoria), details: text(raw.detalhes) }}
      />
    </main>
  );
}
