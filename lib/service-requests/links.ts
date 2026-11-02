import { env } from "@/lib/env";

/** Link the provider sends to the client to confirm the service (spec 3.3). */
export function clientLink(clientToken: string): string {
  return `${env().APP_URL}/c/${clientToken}`;
}

/** Link to recommend the provider after the service (spec 3.4). */
export function recommendLink(clientToken: string): string {
  return `${env().APP_URL}/r/${clientToken}`;
}
