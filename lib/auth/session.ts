import type { Db } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";

export const SESSION_DAYS = 180;

export type Session = { id: string; phone: string };

export async function createSession(db: Db, phone: string): Promise<{ id: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const { data, error } = await db
    .from("sessions")
    .insert({ phone, expires_at: expiresAt.toISOString() })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id, expiresAt };
}

/** Finds a session that has not expired. The session never stores a role (spec section 7). */
export async function findSession(db: Db, id: string): Promise<Session | null> {
  if (!isUuid(id)) return null;
  const { data, error } = await db
    .from("sessions")
    .select("id, phone")
    .eq("id", id)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function endSession(db: Db, id: string): Promise<void> {
  if (!isUuid(id)) return;
  const { error } = await db.from("sessions").delete().eq("id", id);
  if (error) throw error;
}
