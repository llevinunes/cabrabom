import { toggleBusy } from "./actions";

/** "Seu status" card of screen 10: a switch that is on while the provider is free. */
export function StatusSwitch({ busy }: { busy: boolean }) {
  const free = !busy;
  return (
    <form action={toggleBusy} className="flex items-start justify-between gap-4 rounded-card border border-borda bg-superficie p-4">
      <input type="hidden" name="busy" value={String(free)} />
      <div className="flex flex-col gap-1">
        <span className="text-sm text-secundario">Seu status</span>
        <span id="status-label" className="text-lg leading-tight font-extrabold">
          {free ? "Livre para novos serviços" : "Ocupado no momento"}
        </span>
        <span className="text-[13px] text-secundario">
          Quando um serviço começa, você fica ocupado automaticamente.
        </span>
      </div>
      <button
        type="submit"
        role="switch"
        aria-checked={free}
        aria-labelledby="status-label"
        className={`relative mt-1 h-8 w-14 shrink-0 rounded-full transition-colors ${free ? "bg-livre-texto" : "bg-borda"}`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-1 size-6 rounded-full bg-white shadow transition-all ${free ? "left-7" : "left-1"}`}
        />
      </button>
    </form>
  );
}
