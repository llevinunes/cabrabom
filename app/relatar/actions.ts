"use server";

import { createReport, REPORT_MAX_LENGTH } from "@/lib/reports/create";
import { withinLimit } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/supabase/server";
import { getClientIp } from "@/server/request-ip";

export type ReportState = { error: string } | { sent: true } | null;

/** Per IP and hour: generous for shared mobile IPs (CGNAT), still stops a flood. */
const REPORTS_PER_IP = 5;

/** "Relatar problema" (spec 3.5): anonymous, private, rate limited. */
export async function sendReport(_previous: ReportState, form: FormData): Promise<ReportState> {
  const description = String(form.get("description") ?? "").trim();
  if (!description) return { error: "Conte o que aconteceu" };
  if (description.length > REPORT_MAX_LENGTH) return { error: `Use até ${REPORT_MAX_LENGTH} caracteres` };

  const db = createServerClient();
  if (!(await withinLimit(db, `report:${await getClientIp()}`, REPORTS_PER_IP, 60))) {
    return { error: "Muitos relatos seguidos. Tente de novo mais tarde." };
  }
  const saved = await createReport(db, {
    providerId: String(form.get("provider") ?? "") || undefined,
    requestToken: String(form.get("request") ?? "") || undefined,
    description,
  });
  return saved ? { sent: true } : { error: "Não encontramos o prestador ou o serviço deste relato." };
}
