# ADR 0043: Migrações aplicadas pelo GitHub Actions

- **Status:** Aceita
- **Data:** 2026-11-03
- **Proposta por:** Usuário e IA

## Contexto

O ADR 0042 aplica as migrações com `supabase db push` rodado à mão no Mac do usuário. Cada merge na `main` com migração nova exigiria lembrar de rodar o comando, e a Vercel publica o código novo na hora do merge, então esquecer quebra as telas que dependem da migração.

## Decisão

- O workflow `.github/workflows/migracoes.yml` roda `supabase db push` a cada push na `main` que mude `supabase/migrations/` (usuário). Também pode ser disparado à mão na aba Actions (IA).
- Usa a versão da CLI do Supabase do `package-lock.json`, a mesma do desenvolvimento (IA).
- Os segredos ficam no GitHub: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD` e `SUPABASE_PROJECT_ID`. Sem eles o workflow falha logo no início, com o nome do segredo que falta (IA).
- Uma execução por vez (`concurrency`), sem cancelar a que está rodando (IA).
- O `seed.sql` continua fora da produção.

## Alternativas consideradas

- **Continuar à mão:** fácil de esquecer, e o erro só aparece em produção.
- **Integração GitHub do Supabase (Branching):** aplica as migrações sozinha, mas cria um banco de preview por PR, mais do que o projeto precisa agora.

## Consequências

- Positivas: o banco acompanha a `main` sem passo manual; o histórico de cada aplicação fica na aba Actions.
- Negativas: o workflow e o deploy da Vercel começam juntos no merge. O `db push` costuma terminar antes do build, mas durante esse intervalo o código novo pode encontrar o banco antigo. Por isso as migrações devem continuar compatíveis com o código anterior (coluna nova com valor padrão, nada removido na mesma versão que ainda o usa). Se o workflow falhar, o GitHub avisa por e-mail e a Vercel publica mesmo assim.
