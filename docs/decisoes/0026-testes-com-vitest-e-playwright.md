# ADR 0026: Testes com Vitest e Playwright

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** IA

## Contexto

O projeto é desenvolvido com testes primeiro. As regras de negócio ficam em `lib/` (ADR 0016) e boa parte delas depende do banco (PostGIS, índices únicos, funções SQL).

## Decisão

- **Vitest** para as regras de `lib/` (projeto `unit`) e para componentes React com Testing Library e jsdom (projeto `dom`). Os dois rodam com `npm test`.
- Testes contra o **Supabase local** num projeto separado (`db`), rodado com `npm run test:db`, sem paralelismo entre arquivos.
- **Playwright** para o fluxo principal no navegador (`npm run test:e2e`), numa tela de 390 × 844.

## Alternativas consideradas

- **Jest:** mais lento e com configuração extra para TypeScript e ESM.
- **Mockar o banco:** os testes deixariam de pegar erros de SQL e de PostGIS, que são justamente o núcleo da busca.

## Consequências

- Positivas: testes rápidos para as regras e testes reais para o banco e o fluxo.
- Negativas: `test:db` e `test:e2e` exigem Docker com o Supabase local rodando.
