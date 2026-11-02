import { startChatFromSearch } from "@/app/p/chat-actions";
import { Button } from "@/components/ui/Button";
import type { SearchParams } from "@/lib/search/params";

/**
 * "Conversar no WhatsApp". With a search the provider can answer, it is a POST form
 * (never a link: links get prefetched and would open requests nobody asked for).
 * Without one, it goes to the page that asks for name, category and details.
 */
export function ChatButton({
  providerId,
  search,
  offersCategory,
}: {
  providerId: string;
  search: SearchParams | null;
  offersCategory: boolean;
}) {
  if (!search || !offersCategory) {
    const query = search
      ? `?${new URLSearchParams({ nome: search.name, detalhes: search.details })}`
      : "";
    return (
      <Button variant="whatsapp" href={`/p/${providerId}/conversar${query}`}>
        Conversar no WhatsApp
      </Button>
    );
  }

  return (
    <form action={startChatFromSearch}>
      <input type="hidden" name="provider_id" value={providerId} />
      <input type="hidden" name="name" value={search.name} />
      <input type="hidden" name="category" value={search.category} />
      <input type="hidden" name="details" value={search.details} />
      <input type="hidden" name="lat" value={search.lat} />
      <input type="hidden" name="lng" value={search.lng} />
      <Button type="submit" variant="whatsapp">
        Conversar no WhatsApp
      </Button>
    </form>
  );
}
