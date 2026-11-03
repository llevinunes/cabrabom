# ADR 0031: Migrações numeradas em sequência

- **Status:** Aceita
- **Data:** 2026-11-01
- **Proposta por:** Usuário

## Contexto

O Supabase CLI cria migrações com um timestamp no nome (`20261101120000_initial_schema.sql`). Isso evita colisões quando muitas pessoas trabalham em paralelo, mas dificulta a leitura e a referência em PRs e ADRs.

## Decisão

- As migrações em `supabase/migrations/` usam um número sequencial de 4 dígitos: `0001_initial_schema.sql`, `0002_provider_functions.sql`, `0003_...`. O CLI aceita qualquer prefixo numérico e aplica na ordem dele.
- A primeira linha de cada migração diz o número, a versão do app e o PR em que ela entrou: `-- 0003 · v0.3.0 · PR #4`.
- Uma migração já mergeada em `develop` nunca é editada; mudanças vão numa migração nova.
- Para criar uma, copie o próximo número livre em vez de usar `supabase migration new`.

## Alternativas consideradas

- **Timestamp (padrão do CLI):** sem colisões, mas sem ordem legível.
- **Versão do app no nome:** o CLI não aceita pontos no prefixo, e uma versão pode ter várias migrações ou nenhuma.

## Consequências

- Positivas: a ordem e a origem de cada migração ficam visíveis; é fácil citar "migração 0003".
- Negativas: duas branches paralelas podem criar o mesmo número; quem mergear depois renumera.
