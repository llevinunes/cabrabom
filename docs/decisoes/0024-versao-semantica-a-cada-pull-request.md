# ADR 0024: Versão semântica a cada pull request

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário

## Contexto

Com muitos PRs pequenos, é útil saber pela versão o quanto o app mudou desde a última vez.

## Decisão

Todo PR sobe a versão do `package.json` **uma vez**, conforme o peso da mudança:

- **Segundo número (minor):** funcionalidade nova, mudança de comportamento visível ou migração de banco.
- **Terceiro número (patch):** correção, ajuste visual, refatoração, testes, documentação ou configuração.

O primeiro número só muda por decisão explícita do usuário. O projeto começa em `0.1.0`.

## Alternativas consideradas

- **Versão só no lançamento:** perde o registro do ritmo de mudanças.
- **Versão calculada pelos commits (semantic-release):** automação a mais para um projeto pequeno.

## Consequências

- Positivas: a versão indica o peso de cada entrega.
- Negativas: PRs empilhados podem disputar o mesmo número; ao rebasear, a versão é recalculada a partir de `develop`.
