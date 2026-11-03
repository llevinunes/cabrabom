import { Icon } from "@/components/ui/Icon";

const STEPS = ["Pedido enviado", "Aceito pelo prestador", "Em andamento", "Finalizado"];

export type ServiceTimelineStatus = "accepted" | "in_progress" | "completed" | "recommended";

const CURRENT: Record<ServiceTimelineStatus, number> = { accepted: 1, in_progress: 2, completed: 3, recommended: 3 };

/** Screen 05: where the service is, from "Pedido enviado" to "Finalizado". */
export function ServiceTimeline({ status }: { status: ServiceTimelineStatus }) {
  const current = CURRENT[status];
  return (
    <ol className="flex flex-col gap-4 rounded-card border border-borda bg-superficie p-4">
      {STEPS.map((step, index) => {
        const isCurrent = index === current;
        // The last step is done as soon as it is reached.
        const done = index < current || (isCurrent && index === STEPS.length - 1);
        return (
          <li key={step} aria-current={isCurrent ? "step" : undefined} className="flex items-center gap-3">
            {done ? (
              <span className="flex size-7 items-center justify-center rounded-full bg-livre-fundo text-livre-texto">
                <Icon name="check" className="size-4" />
              </span>
            ) : isCurrent ? (
              <span className="size-7 rounded-full bg-capacete" />
            ) : (
              <span className="size-7 rounded-full border-[1.5px] border-borda" />
            )}
            <span className={isCurrent ? "font-extrabold" : index > current ? "text-secundario" : ""}>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
