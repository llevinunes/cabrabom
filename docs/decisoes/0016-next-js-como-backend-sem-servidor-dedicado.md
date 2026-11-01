# ADR 0016: Next.js como backend, sem servidor dedicado

- **Status:** Aceita (pode ser revista se o objetivo incluir aprender a construir uma API dedicada)
- **Data:** 2026-11-01
- **Proposta por:** IA

## Contexto

O backend do app é leve: consultas rápidas, um webhook, notificações e duas rotinas.

## Decisão

O backend roda no próprio **Next.js** (Server Components, Server Actions e Route Handlers) como funções serverless na Vercel, com o Supabase para banco, storage, Realtime e `pg_cron`. A **lógica de negócio fica em `lib/`**, em funções independentes do Next.js.

## Alternativas consideradas

- **API dedicada (Fastify, NestJS):** mais controle e aprendizado de API, ao custo de dois deploys e duplicação de tipos.

## Consequências

- Positivas: um deploy, uma linguagem, custo zero no início.
- Negativas: limites de tempo das funções serverless, partida a frio e dependência da Vercel; se surgir um backend dedicado, ele reaproveita a `lib/`.
