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
    .select("status, created_at, client_name, details, distance_km, categories(name), providers(id, whatsapp)")
    .eq("provider_token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    status: data.status,
    createdAt: new Date(data.created_at),
    clientName: data.client_name,
    details: data.details,
    distanceKm: data.distance_km === null ? null : Number(data.distance_km),
    category: data.categories.name,
    providerId: data.providers.id,
    providerWhatsapp: data.providers.whatsapp,
  };
}
