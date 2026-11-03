# ADR 0005: Cliente sem cadastro; login só ao confirmar o serviço

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário

## Contexto

Exigir cadastro antes da busca afasta clientes que só querem resolver um problema rápido.

## Decisão

O cliente busca e entra em contato **sem login**, informando só nome, categoria e detalhes. O login (via WhatsApp, ADR 0009) acontece **apenas no passo de confirmar o serviço**, quando passa a ser útil: acompanhar o serviço e poder recomendar.

## Alternativas consideradas

- **Cadastro obrigatório na entrada:** mais dados, menos uso.
- **Nenhum login do cliente:** impossibilita verificar quem recomenda (ADR 0011).

## Consequências

- Positivas: a busca é imediata.
- Negativas: contatos que não chegam à confirmação ficam anônimos, sem canal de aviso (ex.: solicitação expirada).
