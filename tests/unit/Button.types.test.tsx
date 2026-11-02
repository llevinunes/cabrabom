// Type-level checks, enforced by `npm run typecheck` (tsc), not by Vitest.
import { Button } from "@/components/ui/Button";

export const buttonTypeIsRequired = (
  <>
    {/* @ts-expect-error a <button> must say whether it submits the form */}
    <Button>Sem tipo</Button>
    <Button type="submit">Buscar prestadores</Button>
    <Button type="button">Agora não</Button>
    <Button href="/painel">Meu painel</Button>
  </>
);
