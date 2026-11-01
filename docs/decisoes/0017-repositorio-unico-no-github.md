# ADR 0017: Repositório único no GitHub

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** IA

## Contexto

O projeto tem app, banco, documentação e design, e é aberto para estudo.

## Decisão

Um **único repositório**, com o app Next.js, `supabase/` (migrações e seed), `design/`, `docs/` e `.env.example`. Segredos nunca entram no repositório; o *secret scanning* do GitHub fica ativado.

## Alternativas consideradas

- **Repositórios separados (front, back, docs):** mudanças relacionadas ficariam espalhadas.

## Consequências

- Positivas: quem estuda encontra tudo num lugar; mudanças de banco e código no mesmo commit.
- Negativas: se o projeto crescer muito, pode exigir organização em workspaces (`apps/`).
