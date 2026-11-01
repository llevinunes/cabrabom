# ADR 0022: Fluxo git com develop, branches feature e pull requests

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário

## Contexto

O código é escrito em grande parte com assistência de IA, e o autor precisa revisar cada mudança antes que ela entre no projeto.

## Decisão

- `main` só recebe versões estáveis; o trabalho do dia a dia entra em `develop`.
- Cada funcionalidade é feita numa branch `feature/<nome>` e entra em `develop` por um **pull request revisado e mergeado pelo usuário**.
- Quando uma funcionalidade depende de outra ainda em revisão, a branch nova parte da anterior (PRs empilhados) e o PR aponta para ela.
- Os commits são curtos, em **Conventional Commits**, em português (`feat(busca): ...`, `fix: ...`).

## Alternativas consideradas

- **Trunk-based (tudo direto na main):** mais rápido, mas sem um ponto de revisão.
- **Merge local feito pela IA:** descartado pelo usuário em favor da revisão no GitHub.

## Consequências

- Positivas: toda mudança passa por revisão humana; o histórico conta a história do projeto em passos pequenos.
- Negativas: PRs empilhados exigem atenção à ordem de merge.
