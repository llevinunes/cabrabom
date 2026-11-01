# ADR 0002: Postgres com PostGIS, via Supabase

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** IA (a partir da dúvida do usuário entre Mongo e Postgres)

## Contexto

A consulta central do app é geográfica: prestadores de uma categoria dentro de um raio, ordenados por disponibilidade e distância. O restante do modelo (prestadores, categorias, solicitações, recomendações) é relacional.

## Decisão

Usar **Postgres com a extensão PostGIS**, hospedado no **Supabase**, que também oferece storage, Realtime e `pg_cron`.

## Alternativas consideradas

- **MongoDB:** tem índice geoespacial (`2dsphere`), mas o modelo relacional exigiria simular joins.
- **Neon + Drizzle:** boa alternativa de Postgres puro; perde storage e Realtime integrados.

## Consequências

- Positivas: busca por raio em uma única query com índice espacial (`ST_DWithin`); integridade garantida pelo banco (ex.: índice único de recomendação por cliente); vários serviços em um só fornecedor.
- Negativas: dependência do Supabase, mitigada por ser Postgres padrão.
