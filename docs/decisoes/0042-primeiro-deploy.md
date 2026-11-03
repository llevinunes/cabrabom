# ADR 0042: Primeiro deploy

- **Status:** Aceita
- **Data:** 2026-11-03
- **Proposta por:** Usuário e IA

## Contexto

Com o ciclo do serviço completo (Fase 2), o app vai para um primeiro teste em campo com pessoas próximas do usuário, para ver as dificuldades reais de quem usa. O usuário só tem conta na Vercel e quer custo zero.

## Decisão

- **App:** Vercel, plano gratuito, endereço `*.vercel.app`, deploy de produção a partir da `main` (usuário).
- **Banco:** Supabase Cloud, plano gratuito, região São Paulo. Migrações aplicadas com `supabase db push`.
- **Categorias numa migração** (`0011`), porque são dado do produto; o `seed.sql` fica só com os prestadores de exemplo e nunca roda em produção (IA).
- **WhatsApp:** número de teste da Meta, com até 5 telefones cadastrados (usuário). Trocar por um chip próprio depois só muda variáveis.
- **Variáveis obrigatórias no deploy de produção:** com `VERCEL_ENV=production`, o `next.config.ts` valida as variáveis e o build falha se faltar `WHATSAPP_VERIFY_TOKEN`, `META_APP_SECRET` ou `CRON_SECRET`, ou se `APP_URL` não for o endereço público em `https://`. Sem isso, o deploy ficaria verde e o login, os lembretes ou os links do WhatsApp quebrariam em silêncio. O build local não exige (IA).
- **Versão 1.0.0** no primeiro deploy (usuário).
- O passo a passo fica em `docs/deploy.md`.

## Alternativas consideradas

- **Exigir os segredos com `NODE_ENV=production`:** o `next build` local também roda assim e passaria a falhar.
- **Chip próprio já no primeiro teste:** desnecessário para até 5 pessoas.

## Consequências

- Positivas: custo zero, deploy reproduzível e um guia para quem não acompanhou o desenvolvimento.
- Negativas: o Supabase gratuito pausa depois de 7 dias sem uso; o grupo de teste não pode passar de 5 telefones.
