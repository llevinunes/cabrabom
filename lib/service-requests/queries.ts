import type { Db } from "@/lib/supabase/server";
import { expiryCutoff } from "./expiry";

const TOKEN = /^[A-Za-z0-9_-]{24}$/;
const PANEL_LIMIT = 20;

export type PendingRequest = { token: string; clientName: string; category: string; createdAt: Date };

/** "Aguardando sua resposta" (screen 10): open and not yet expired, newest first. */
export async function pendingRequests(db: Db, providerId: string): Promise<PendingRequest[]> {
  const { data, error } = await db
    .from("service_requests")
    .select("provider_token, client_name, created_at, categories(name)")
    .eq("provider_id", providerId)
    .eq("status", "open")
    .gt("created_at", expiryCutoff().toISOString())
    .order("created_at", { ascending: false })
    .limit(PANEL_LIMIT);
  if (error) throw error;
  return data.map((row) => ({
    token: row.provider_token,
    clientName: row.client_name,
    category: row.categories.name,
    createdAt: new Date(row.created_at),
  }));
}

export type RequestForProvider = {
  status: string;
  createdAt: Date;
  /** Set when the provider accepts; the client's link is /c/{clientToken}. */
  clientToken: string | null;
  clientName: string;
  details: string;
  /** Computed from the position the client sent; approximate. */
  distanceKm: number | null;
  category: string;
  providerId: string;
  providerWhatsapp: string;
};

/** The request behind /s/[token]. The caller must check the session phone against providerWhatsapp. */
export async function requestByToken(db: Db, token: string): Promise<RequestForProvider | null> {
  if (!TOKEN.test(token)) return null;
  const { data, error } = await db
    .from("service_requests")
    .select("status, created_at, client_token, client_name, details, distance_km, categories(name), providers(id, whatsapp)")
    .eq("provider_token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    status: data.status,
    createdAt: new Date(data.created_at),
    clientToken: data.client_token,
    clientName: data.client_name,
    details: data.details,
    distanceKm: data.distance_km === null ? null : Number(data.distance_km),
    category: data.categories.name,
    providerId: data.providers.id,
    providerWhatsapp: data.providers.whatsapp,
  };
}

export type AcceptedRequest = {
  providerToken: string;
  clientToken: string;
  clientName: string;
  category: string;
  acceptedAt: Date;
};

/** "Esperando o cliente confirmar": accepted by the provider, not confirmed by the client yet. */
export async function acceptedRequests(db: Db, providerId: string): Promise<AcceptedRequest[]> {
  const { data, error } = await db
    .from("service_requests")
    .select("provider_token, client_token, client_name, accepted_at, categories(name)")
    .eq("provider_id", providerId)
    .eq("status", "accepted")
    .order("accepted_at", { ascending: false })
    .limit(PANEL_LIMIT);
  if (error) throw error;
  return data.map((row) => ({
    providerToken: row.provider_token,
    clientToken: row.client_token!,
    clientName: row.client_name,
    category: row.categories.name,
    acceptedAt: new Date(row.accepted_at!),
  }));
}

export type RequestForClient = {
  status: string;
  clientName: string;
  details: string;
  category: string;
  /** Set when the client confirms: only this phone may follow the service. */
  clientPhone: string | null;
  clientConfirmedAt: Date | null;
  completedAt: Date | null;
  providerId: string;
  providerName: string;
  providerWhatsapp: string;
};

/** The request behind /c/[token] and /r/[token]. */
export async function requestByClientToken(db: Db, token: string): Promise<RequestForClient | null> {
  if (!TOKEN.test(token)) return null;
  const { data, error } = await db
    .from("service_requests")
    .select(
      "status, client_name, details, client_phone, client_confirmed_at, completed_at, categories(name), providers(id, name, whatsapp)",
    )
    .eq("client_token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    status: data.status,
    clientName: data.client_name,
    details: data.details,
    category: data.categories.name,
    clientPhone: data.client_phone,
    clientConfirmedAt: data.client_confirmed_at ? new Date(data.client_confirmed_at) : null,
    completedAt: data.completed_at ? new Date(data.completed_at) : null,
    providerId: data.providers.id,
    providerName: data.providers.name,
    providerWhatsapp: data.providers.whatsapp,
  };
}

export type InProgressRequest = {
  providerToken: string;
  clientName: string;
  category: string;
  details: string;
  confirmedAt: Date;
};

/** "Em andamento" (screen 10): services the client confirmed, newest first. */
export async function inProgressRequests(db: Db, providerId: string): Promise<InProgressRequest[]> {
  const { data, error } = await db
    .from("service_requests")
    .select("provider_token, client_name, details, client_confirmed_at, categories(name)")
    .eq("provider_id", providerId)
    .eq("status", "in_progress")
    .order("client_confirmed_at", { ascending: false })
    .limit(PANEL_LIMIT);
  if (error) throw error;
  return data.map((row) => ({
    providerToken: row.provider_token,
    clientName: row.client_name,
    category: row.categories.name,
    details: row.details,
    confirmedAt: new Date(row.client_confirmed_at!),
  }));
}

const RECOMMENDATION_ASK_DAYS = 7;
const RECOMMENDATION_ASK_LIMIT = 10;

export type FinishedRequest = { clientToken: string; clientName: string; completedAt: Date };

/**
 * "Peça uma recomendação" (spec 3.3, step 4): services the provider finished in the last
 * days. When the client finished, the recommendation form already showed up for them.
 */
export async function finishedAwaitingRecommendation(db: Db, providerId: string): Promise<FinishedRequest[]> {
  const since = new Date(Date.now() - RECOMMENDATION_ASK_DAYS * 24 * 3_600_000).toISOString();
  const { data, error } = await db
    .from("service_requests")
    .select("client_token, client_name, completed_at")
    .eq("provider_id", providerId)
    .eq("status", "completed")
    .eq("completed_by", "provider")
    .gt("completed_at", since)
    .order("completed_at", { ascending: false })
    .limit(RECOMMENDATION_ASK_LIMIT);
  if (error) throw error;
  return data.map((row) => ({
    clientToken: row.client_token!,
    clientName: row.client_name,
    completedAt: new Date(row.completed_at!),
  }));
}
