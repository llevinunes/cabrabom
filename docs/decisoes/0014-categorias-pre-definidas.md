# ADR 0014: Categorias pré-definidas

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário

## Contexto

Categorias livres gerariam duplicatas ("Eletricista", "eletrecista", "Elétrica") e quebrariam a busca.

## Decisão

As categorias são cadastradas **só pela gerência**; o prestador apenas seleciona. Categorias são desativadas, não apagadas (campo `ativa`).

## Alternativas consideradas

- **Categorias criadas pelo prestador:** mais flexíveis, mas inconsistentes.

## Consequências

- Positivas: busca confiável e métricas por categoria.
- Negativas: a lista precisa ser mantida pela gerência.
